// data acess object
const Mongo = require('mongodb')
let MongoClient = Mongo.MongoClient
const bookapi = require('./bookapi.js')

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

o.bookshelf = function({user_id}) {
  return o.db.collection('bookshelf')
    .find({'users.user_id': user_id})
    .toArray()
}

o.bookshelf__add = function({book_id, user_id}) {
  bookapi.findId(book_id)
  .then(function(book){
    return o.db.collection('bookshelf').findOneAndUpdate(
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
  return o.db.collection('bookshelf').findOneAndUpdate(
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
  o.db.collection('bookshelf').remove({
    users: {$size: 0}
  })
}

o.my_trade__add = function({book_id, user_id}) {
  return o.db.collection('bookshelf')
    .findOneAndUpdate(
      {_id: book_id, 'users.user_id': user_id},
      {$set:{
        'users.$.trade': {
          creation_date: new Date(),
          fullfilled: false
        }
      }},
      {returnOriginal: false, upsert: false}
    )
}

o.my_trade__remove = function({book_id, user_id}) {
  return o.db.collection('bookshelf')
    .findOneAndUpdate(
      {_id: book_id, 'users.user_id': user_id},
      {$unset: {'users.$.trade':'' } },
      {returnOriginal: false, upsert: false}
    )
}

const five_mins = 5 * 60 * 1000
setInterval(o.bookshelf__garbage_collection, five_mins)


var a = ['bookshelf__add', 'bookshelf__remove', 'bookshelf__garbage_collection']

a.forEach(function(name){
  o[name] = ensureConnected(o[name])
})
return o


}
