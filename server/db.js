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
o.user_books = function({user_id}) {
  return o.db.collection('booktrade__user_books')
    .find({'users.user_id': user_id})
    .toArray()
}

o.user_books__add = function({book_id, user_id}) {
  return new Promise(function(resolve, reject){
    bookapi.nodeapi.lookup(book_id, function(err, book) {
      if (err || book === undefined) {
        console.log('db.js user_books__add err:', err)
        return reject('book_id not found')
      }
      return o.db.collection('booktrade__user_books').findOneAndUpdate(
        {_id: book_id, 'users.user_id': {$ne: user_id} },
        {$set: {book, updated: new Date()},
        $push:{
          users: {user_id, creation_date: new Date()}
        }},
        { returnOriginal: false, upsert: true })
      .then(function(result){
        return resolve(result.value)
      })
      .catch(function(err){
        console.log('db.js user_books__add err:', err)
        return reject(err)
      })
    })
  })
}

o.user_books__remove = function({book_id, user_id}) {
  return o.db.collection('booktrade__user_books').findOneAndUpdate(
    {_id: book_id},
    {$pull: {users: {user_id: user_id}} },
    {returnOriginal: false}
  ).then(function(result){
    return Promise.resolve(result.value)
  })
  .catch(function(err){
    console.log('db.js user_books__remove err:', err)
    return Promise.reject(err)
  })
}

o.user_books__garbage_collection = function() {
  o.db.collection('booktrade__user_books').remove({
    users: {$size: 0}
  })
}

o.user_bookreqs__add = function({book_id, user_id}){
  o.db.collection('user_bookreqs')
}


var a = ['user_books__add', 'user_books__remove', 'user_books__garbage_collection']

a.forEach(function(name){
  o[name] = ensureConnected(o[name])
})
return o


}
