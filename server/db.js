// data acess object
const Mongo = require('mongodb')
let MongoClient = Mongo.MongoClient
const bookapi = require('./bookapi.js')

module.exports = function({mongourl, coll_name}) {


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

o.my_books = function({user_id}) {
  return o.db.collection('booktrade__my_books')
    .find({'users.user_id': user_id})
    .toArray()
}

o.my_books__add = function({book_id, user_id}) {
  bookapi.findId(book_id)
  .then(function(book){
    return o.db.collection('booktrade__my_books').findOneAndUpdate(
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
    console.log('db.js my_books__add err:', err)
    return reject(err)
  })
}

o.my_books__remove = function({book_id, user_id}) {
  return o.db.collection('booktrade__my_books').findOneAndUpdate(
    {_id: book_id},
    {$pull: {users: {user_id: user_id}} },
    {returnOriginal: false}
  ).then(function(result){
    return Promise.resolve(result.value)
  })
  .catch(function(err){
    console.log('db.js my_books__remove err:', err)
    return Promise.reject(err)
  })
}

o.my_books__garbage_collection = function() {
  o.db.collection('booktrade__my_books').remove({
    users: {$size: 0}
  })
}

o.my_trade__add = function({book_id, user_id}) {
  return o.db.collection('booktrade__my_books')
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
  return o.db.collection('booktrade__my_books')
    .findOneAndUpdate(
      {_id: book_id, 'users.user_id': user_id},
      {$unset: {'users.$.trade':'' } },
      {returnOriginal: false, upsert: false}
    )
}


var a = ['my_books__add', 'my_books__remove', 'my_books__garbage_collection']

a.forEach(function(name){
  o[name] = ensureConnected(o[name])
})
return o


}
