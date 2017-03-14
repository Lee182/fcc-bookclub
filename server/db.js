// data acess object
const Mongo = require('mongodb')
let MongoClient = Mongo.MongoClient
const bookapi = require('./bookapi.js')
const ip2loci = require('./ip2loci.js')

const booksdb_name = 'bookshelf'
const usersdb_name = 'bookshelf_users'
module.exports = function({mongourl}) {


let o = {
  db: null,
  ObjectId: Mongo.ObjectId
}

function ensureConnected(fn) {return function() {
  if (o.db === null) {return Promise.resolve({err: 'db disconnected'})}
  return fn.apply(o, arguments)
}}

o.connect = function() {
  console.log('mongo connnecting...')
  return MongoClient.connect(mongourl).then(function(db){
    console.log('mongo connected') // setup db
    o.db = db
  }).catch(function(err){
    console.log('mongo connection error:', err)
    o.db = null
  })
}

o.user__findOne = function({user_id}){
  return o.db.collection(usersdb_name).findOne({_id:user_id})
  .then(function(user){
    if (user === null){
      return undefined
    }
    return user
  })
}

o.user__add = function({user_id}) {
  // TODO make sure user_id valid
  return o.db.collection(usersdb_name).insert(
    {_id: user_id, user_id},
    {returnOriginal: false}
  ).then(function(res){
    return res.ops[0]
  })
}

o.user__add_loci_fromip = function({user_id, ip}) {
  return ip2loci(ip).then(function(loci){
    return o.user__change_loci({user_id, loci})
  }).catch(function(err){
    console.log('user__add_loci', err)
  })
}

o.user__change_loci = function({user_id, loci}) {
  // TODO make sure loci valid, then
  return o.db.collection(usersdb_name)
    .findOneAndUpdate(
      {_id: user_id},
      {$set: {loci}},
      {returnOriginal: false, upsert: false})
    .then(function(res){
      return res.value
    })
}


o.bookshelf = function({user_id}) {
  return o.db.collection(booksdb_name)
    .find({'users.user_id': user_id})
    .sort({'users.creation_date': -1})
    .toArray()
}

o.bookshelf__add = function({book_id, user_id}) {
  return bookapi.findId(book_id)
  .then(function(book){
    return o.db.collection(booksdb_name).findOneAndUpdate(
      {_id: book_id, 'users.user_id': {$ne: user_id} },
      {$set: {book, updated: new Date()},
      $push:{
        users: {user_id, creation_date: new Date()}
      }},
      { returnOriginal: false, upsert: true })
  })
  .then(function(result){
    return Promise.resolve(result.value)
  })
  .catch(function(err){
    console.log('db.js bookshelf__add err:', err)
    return reject(err)
  })
}

o.bookshelf__remove = function({book_id, user_id}) {
  return o.db.collection(booksdb_name).findOneAndUpdate(
    {_id: book_id},
    {$pull: {users: {user_id: user_id}} },
    {returnOriginal: false}
  ).then(function(result){
    return Promise.resolve(result.value)
  })
  .catch(function(err){
    console.log('db.js bookshelf__remove err:', err)
    return Promise.reject(err)
  })
}

o.bookshelf__garbage_collection = function() {
  o.db.collection(booksdb_name).remove({
    users: {$size: 0}
  })
}

o.trade__list = function({book_id, user_id}) {
  return o.db.collection(booksdb_name)
    .findOneAndUpdate(
      {_id: book_id, 'users.user_id': user_id},
      {$set:{
        'users.$.trade': {
          creation_date: new Date(),
          fullfilled: false,
          requests: []
        }
      }},
      {returnOriginal: false, upsert: false}
    )
}

o.trade__unlist = function({book_id, user_id}) {
  return o.db.collection(booksdb_name)
    .findOneAndUpdate(
      {_id: book_id, 'users.user_id': user_id},
      {$unset: {'users.$.trade':'' } },
      {returnOriginal: false, upsert: false}
    )
}


o.tradeshelf = function({user_id}) {
  return o.db.collection(booksdb_name)
  .find({
    'users.user_id': user_id,
    'users.trade': {$exists: 1}
  })
  .toArray()
}

o.books_for_trade = function() {
  return o.db.collection(booksdb_name).find({
    'users.trade.fullfilled': false
  })
}

o.trade__request = function({book_id, book_owner, user_id}) {
  return o.db.collection(booksdb_name).findOneAndUpdate(
    {
      _id: book_id,
      users: {$elemMatch: {
        user_id: book_owner,
        'trade.fullfilled': false,
        'trade.requests.user_id': {$ne: user_id}
      }},
    }, // query ensures only 1 request for book from owner
    {$push: {
      'users.$.trade.requests': {
        user_id: user_id,
        creation_date: new Date()
      }
    }},
    {returnOriginal: false, upsert: false}
  ).then(function(writeResult){
    return Promise.resolve(writeResult)
  })
}

o.trade__request_remove = function({book_id, book_owner, user_id}){
  return o.db.collection(booksdb_name)
    .findOneAndUpdate({
      _id: book_id,
      users: {$elemMatch: {
        user_id: book_owner,
        'trade.fullfilled': false,
        'trade.requests.user_id': user_id}
      }
    }, // query ensures only 1 request for book from owner
    {$pull: {
      'users.$.trade.requests': {
        user_id: user_id,
      }
    }},
    {returnOriginal: false, upsert: false})
    .then(function(writeResult){
      console.log('/trade__request_remove', writeResult)
      return Promise.resolve(writeResult)
    })
}

o.book__get = function({book_id}){
  return o.db.collection(booksdb_name).findOne({_id: book_id})
  .then(function(res){
    if (res === null) {
      return undefined
    }
    return res
  })
}

const five_mins = 5 * 60 * 1000
setInterval(o.bookshelf__garbage_collection, five_mins)


var a = ['bookshelf__add', 'bookshelf__remove', 'bookshelf__garbage_collection', 'trade__list', 'trade__unlist', 'trade__request','trade__request_remove',
'user__findOne', 'user__add', 'user__add_loci_fromip', 'user__change_loci', 'book__get']

a.forEach(function(name){
  o[name] = ensureConnected(o[name])
})
return o


}
