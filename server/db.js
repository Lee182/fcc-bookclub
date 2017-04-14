// data acess object
const Mongo = require('mongodb')
let MongoClient = Mongo.MongoClient
const bookapi = require('./api/book.js')
const ip2loci = require('./api/ip2loci.js')

const booksdb_name = 'bookshelf'
const usersdb_name = 'bookshelf_users'

const eventSysetem = require('../app/browser+node/eventSystem.js')

module.exports = function({mongourl}) {

const e = eventSysetem()

let o = {
  db: null,
  ObjectId: Mongo.ObjectId,
  e
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
    e.emit('book.update', result.value)
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
    ).then(function(result){
      e.emit('book.update', result.value)
      return result.value
    })
}

o.trade__unlist = function({book_id, user_id}) {
  return o.db.collection(booksdb_name)
    .findOneAndUpdate(
      {_id: book_id, 'users.user_id': user_id},
      {$unset: {'users.$.trade':'' } },
      {returnOriginal: false, upsert: false}
    ).then(function(result){
      e.emit('book.update', result.value)
      return result.value
    })
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

o.trade__request = function({book_id, owner_id, user_id}) {
  return o.db.collection(booksdb_name).findOneAndUpdate(
    {
      _id: book_id,
      users: {$elemMatch: {
        user_id: owner_id,
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
  ).then(function(result){
    // new notifycation
    e.emit('trade.request', {book_id, owner_id, user_id, type: 'trade.request', result: result.value})
    return Promise.resolve(result.value)
  })
}

o.trade_respond = function({request, accept_or_decline}) {
  console.log(request)
  request._id.request.creation_date = new Date(request._id.request.creation_date)
  var words = ['accept', 'decline']
  if (accept_or_decline === false) {words = words.reverse()}
  return o.db.collection(booksdb_name).findOne({
    _id: request.book._id,
    users: {
      $elemMatch: {
        user_id: request._id.owner_id,
        'trade.requests': {$elemMatch: request._id.request}
      }
    }
  }).then(function(doc){
    if (doc === null) {return Promise.reject()}
    var i = doc.users.findIndex(function(user){
      return request._id.owner_id === user.user_id
    })
    if (i === -1) {return Promise.reject()}
    var j = doc.users[i].trade.requests.findIndex(function(user){
      return request._id.request.user_id === user.user_id
    })
    if (j === -1) {return Promise.reject()}
    doc.users[i].trade.requests[j][words[0]] = true
    doc.users[i].trade.requests[j][words[0]+'_date'] = new Date()

    delete doc.users[i].trade.requests[j][words[1]]
    delete doc.users[i].trade.requests[j][words[1]+'_date']
    return doc
  })
  .then(function(doc){
    return o.db.collection(booksdb_name).findOneAndReplace({
      _id: doc._id
    }, doc, {returnOriginal: false})
  })
  .then(function(result){
    e.emit('book.update', result.value)
    e.emit('trade.respond', {book: result.value, request, words})
    return result.value
  })

}

o.trade_requests__get = function({user_id, owner_id}) {
  var firstPipe = {$match: {'users.trade.requests': {$exists: 1}}}
  var lastPipe = {$match: {} }
  if (owner_id) {
    firstPipe.$match['users.user_id'] = owner_id
    lastPipe.$match['_id.owner_id'] = owner_id
  }
  if (user_id) {
    lastPipe.$match['_id.request.user_id'] = user_id
  }
  return o.db.collection(booksdb_name).aggregate([
    firstPipe,
    {$project: {_id: {_id: '$_id', title: '$book.title'}, user: '$users'}},
    {$unwind: '$user'},
    {$unwind: '$user.trade.requests'},
    {$project: {
      _id: {
        owner_id: '$user.user_id',
        request: '$user.trade.requests'
      },
      book: '$_id'
    }},
    lastPipe
  ]).toArray()
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

o.bookowners = function({book_id}) {
  return o.db.collection('bookshelf')
  .aggregate([
    {$match: {_id: book_id} },
    {$unwind: '$users'},
    {$project: {
      _id: {
        user_id: '$users.user_id',
        book_id: '$_id'
      },
      trade: '$users.trade'
    } },
    {$match: {trade: {$exists: 1}} },
    {$lookup: {
      from: 'bookshelf_users',
      localField: '_id.user_id',
      foreignField: '_id',
      as: 'loci'
    }},
    {$unwind: '$loci'},
    {$project: {
      _id: 0,
      user_id: '$_id.user_id',
      book_id: '$_id.book_id',
      trade: '$trade',
      loci: '$loci.loci'
    }}
    // TODO $geoNear to sort results by distance
    // {$group: {_id: null, count: {$sum: 1}}}
  ]).toArray()
}

o.market = function({page_n}) {
  return db_paging({
    db: o.db,
    coll:'bookshelf',
    query: {'users.trade': {$exists: 1}},
    limit: 20,
    page_n: page_n,
    sort: {'users.trade.creation_date':-1}
  })
}

function db_paging({db, coll, query, project, limit, page_n, sort}) {
  if (limit === undefined) {limit = 30}
  if (page_n === undefined) {page_n = 1}
  if (sort === undefined) {sort = {_id: -1}} // most recent
  if (project === undefined) {project = {}}
  var skip = (page_n - 1) * limit

  return db.collection(coll)
  .find(query, project)
  .sort(sort)
  .limit(limit)
  .skip(skip)
  .toArray()
  .then(function(docs){
    return {
      docs,
      limit,
      page_n,
      query
    }
  })
}



e.on('trade.request', function(info){
  // new
  o.notification__add({user_id: info.owner_id, info})
})

e.on('trade.respond', function(d){
  console.log(d)
  o.notification__add({user_id: d.request._id.request.user_id, info: {
    type: 'trade.respond',
    path: '/book/'+d.book._id,
    message: `@${d.request._id.owner_id} ${d.words[0]}ed your trade request for "${d.request.book.title}"`
  }})
})

o.notification__add = function({user_id, info}) {
  // new
  var note = {
    creation_date: new Date(),
    read: false,
    opened: false
  }
  if (info.type === 'trade.request') {
    note.path = '/book/'+info.book_id
    note.message = `@${info.user_id} requests "${info.result.book.title}"`
  }
  if (info.type === 'trade.respond') {
    note.path = info.path
    note.message = info.message
  }
  return o.db.collection(usersdb_name)
  .findOneAndUpdate(
    {_id: user_id},
    {$push: {notifcations: note}},
    {returnOriginal: false}
  ).then(function(result){
    e.emit('notify', {user: result.value, note})
    return result.value
  })
}

o.note__mark__read = function({note, user_id}){
  console.log(user_id)
  return o.db.collection(usersdb_name)
  .findOneAndUpdate(
    {
      _id: user_id,
      notifcations: {$elemMatch: {
        creation_date: new Date(note.creation_date),
        message: note.message
      } }
    },
    {$set: { 'notifcations.$.read': true } },
    {returnOriginal: false}
  ).then(function(result){
    console.log("result ", result)
    if (result.value === null){return}
    e.emit('notify', {user: result.value, note})
    return result.value
  })
}
o.note__mark__opened = function({note, user_id}){
  return o.db.collection(usersdb_name)
  .findOneAndUpdate(
    {
      _id: user_id,
      notifcations: {$elemMatch: {
        creation_date: new Date(note.creation_date),
        message: note.message
      }}
    },
    {$set: {
      'notifcations.$.opened': true,
      'notifcations.$.read': true
    }},
    {returnOriginal: false}
  ).then(function(result){
    if (result.value === null){return}
    console.log('opend', result.value)

    e.emit('notify', {user: result.value, note})
    return result.value
  })
}

const five_mins = 5 * 60 * 1000
setInterval(o.bookshelf__garbage_collection, five_mins)


// decorate functions
var a = ['bookshelf__add', 'bookshelf__remove', 'bookshelf__garbage_collection', 'trade__list', 'trade__unlist', 'trade__request','trade__request_remove',
'user__findOne', 'user__add', 'user__add_loci_fromip', 'user__change_loci', 'book__get', 'note__mark__read', 'note__mark__opened', 'trade_requests__get', 'trade_respond']

a.forEach(function(name){
  o[name] = ensureConnected(o[name])
})
return o


}
