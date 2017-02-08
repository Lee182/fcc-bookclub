// data acess object
const Mongo = require('mongodb')
let MongoClient = Mongo.MongoClient

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



var a = ['book_remove', 'book_add', 'book_trade_propose', 'book_trade_accept']

a.forEach(function(name){
  o[name] = ensureConnected(o[name])
})
return o


}
