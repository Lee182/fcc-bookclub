# data acess object
import Mongo from 'mongodb'
import bookapi from '~/server/api/book'
import ip2loci from '~/server/api/ip2loci'
import eventSysetem from '~/app/abrowser+node/eventSystem'
MongoClient = Mongo.MongoClient
booksdb_name = 'bookshelf'
usersdb_name = 'bookshelf_users'

export default class DB
  constructor: ({ mongourl }) ->
    @e = eventSysetem()
    @db = null
    @mongourl = mongourl
    @ObjectId = Mongo.ObjectId
    [
      'bookshelf__add'
      'bookshelf__remove'
      'bookshelf__garbage_collection'
      'trade__list'
      'trade__unlist'
      'trade__request'
      # 'trade__request_remove'
      'user__findOne'
      'user__add'
      'user__add_loci_fromip'
      'user__change_loci'
      'book__get'
      'note__mark__read'
      'note__mark__opened'
      'trade_requests__get'
      'trade_respond'
    ].forEach (name) =>
      @[name] = @ensureConnected(@[name])

    five_mins = 5 * 60 * 1000
    setInterval @bookshelf__garbage_collection, five_mins
    @e.on 'trade.request', (info) ->
      @notification__add
        user_id: info.owner_id
        info: info
    @e.on 'trade.respond', (d) ->
      console.log d
      @notification__add
        user_id: d.request._id.request.user_id
        info:
          type: 'trade.respond'
          path: '/book/' + d.book._id
          message: '@' + d.request._id.owner_id + ' ' + d.words[0] + 'ed your trade request for "' + d.request.book.title + '"'
  
  ensureConnected: (fn) ->
    if typeof fn != 'function'
      debugger
      throw Error 'ensureConnected passed fn'
    ->
      if @db == null then err: 'db disconnected'
      fn.apply @, arguments
  
  db_paging: ({ db, coll, query, project, limit, page_n, sort }) ->
    if limit == undefined then limit = 30
    if page_n == undefined then page_n = 1
    if sort == undefined then sort = _id: -1
    if project == undefined then project = {}
    skip = (page_n - 1) * limit
    docs = await db.collection(coll)
    .find(query, project)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .toArray()
    { docs, limit, page_n, query }
  
  connect: ->
    console.log 'mongo connnecting...'
    try
      @db = await MongoClient.connect(@mongourl)
      console.log 'mongo connected'
    catch err
      @db = null
      console.log 'mongo connection error:', err

  user__findOne: ({ user_id }) ->
    user = await @db.collection(usersdb_name).findOne(_id: user_id)
    if user == null then undefined else user

  user__add: ({ user_id }) ->
    # TODO make sure user_id valid
    result = @db.collection(usersdb_name).insert({
      _id: user_id
      user_id: user_id
    }, returnOriginal: false)
    result.ops[0]

  user__add_loci_fromip: ({ user_id, ip }) ->
    loci = await ip2loci(ip)
    await @user__change_loci(user_id: user_id, loci: loci)

  user__change_loci: ({ user_id, loci }) ->
    # TODO make sure loci valid, then
    res = await @db.collection(usersdb_name).findOneAndUpdate(
      { _id: user_id },
      { $set: loci: loci },
      { returnOriginal: false, upsert: false })
    res.value

  bookshelf: ({ user_id }) ->
    @db.collection(booksdb_name).find('users.user_id': user_id).sort('users.creation_date': -1).toArray()

  bookshelf__add: ({ book_id, user_id }) ->
    book = bookapi.findId(book_id)
    try
      result = @db.collection(booksdb_name)
      .findOneAndUpdate(
        { _id: book_id, 'users.user_id': $ne: user_id },
        {
          $set:
            book: book
            updated: new Date
          $push: users:
            user_id: user_id
            creation_date: new Date
        },
        { returnOriginal: false, upsert: true })
      e.emit 'book.update', result.value
      return result.value
    catch err
      console.log 'db.js bookshelf__add err:', err
      err

  bookshelf__remove: ({ book_id, user_id }) ->
    try
      result = await @db.collection(booksdb_name).findOneAndUpdate(
        { _id: book_id },
        { $pull: users: user_id: user_id },
        { returnOriginal: false })
      return result.value
    catch
      console.log 'db.js bookshelf__remove err:', err
      err

  bookshelf__garbage_collection: ->
    @db.collection(booksdb_name).remove users: $size: 0

  trade__list: ({ book_id, user_id }) ->
    result = @db.collection(booksdb_name).findOneAndUpdate(
      { _id: book_id, 'users.user_id': user_id },
      {
        $set: 'users.$.trade':
          creation_date: new Date
          fullfilled: false
          requests: []
      },
      { returnOriginal: false, upsert: false })
    e.emit 'book.update', result.value
    result.value

  trade__unlist: ({ book_id, user_id }) ->
    result = await @db.collection(booksdb_name).findOneAndUpdate(
      { _id: book_id, 'users.user_id': user_id },
      { $unset: 'users.$.trade': '' },
      { returnOriginal: false, upsert: false })
    e.emit 'book.update', result.value
    result.value

  tradeshelf: ({ user_id }) ->
    @db.collection(booksdb_name).find(
      'users.user_id': user_id
      'users.trade': $exists: 1).toArray()

  books_for_trade: ->
    @db.collection(booksdb_name).find 'users.trade.fullfilled': false

  trade__request: ({ book_id, owner_id, user_id }) ->
    result = await @db.collection(booksdb_name).findOneAndUpdate(
      {
        _id: book_id
        users: $elemMatch:
          user_id: owner_id
          'trade.fullfilled': false
          'trade.requests.user_id': $ne: user_id
      },
      {
        $push: 'users.$.trade.requests':
          user_id: user_id
          creation_date: new Date
      },
      { returnOriginal: false, upsert: false })

    # new notifycation
    @e.emit 'trade.request',
      book_id: book_id
      owner_id: owner_id
      user_id: user_id
      type: 'trade.request'
      result: result.value
    result.value

  trade_respond: ({ request, accept_or_decline }) ->
    request._id.request.creation_date = new Date request._id.request.creation_date
    words = [ 'accept', 'decline' ]
    if accept_or_decline == false
      words = words.reverse()
    doc = await @db.collection(booksdb_name).findOne(
      _id: request.book._id
      users: $elemMatch:
        user_id: request._id.owner_id
        'trade.requests': $elemMatch: request._id.request)
    if doc == null then return Promise.reject()
    i = doc.users.findIndex((user) -> request._id.owner_id == user.user_id)
    if i == -1 then return Promise.reject()
    j = doc.users[i].trade.requests.findIndex((user) -> request._id.request.user_id == user.user_id)
    if j == -1 then return Promise.reject()

    doc.users[i].trade.requests[j][words[0]] = true
    doc.users[i].trade.requests[j][words[0] + '_date'] = new Date
    delete doc.users[i].trade.requests[j][words[1]]
    delete doc.users[i].trade.requests[j][words[1] + '_date']
    result = await @db.collection(booksdb_name).findOneAndReplace(
      { _id: doc._id },
      doc,
      { returnOriginal: false })
    @e.emit 'book.update', result.value
    @e.emit 'trade.respond',
      book: result.value
      request: request
      words: words
    result.value

  trade_requests__get: ({ user_id, owner_id }) ->
    firstPipe = $match: 'users.trade.requests': $exists: 1
    lastPipe = $match: {}
    if owner_id
      firstPipe.$match['users.user_id'] = owner_id
      lastPipe.$match['_id.owner_id'] = owner_id
    if user_id
      lastPipe.$match['_id.request.user_id'] = user_id
    @db.collection(booksdb_name).aggregate([
      firstPipe
      { $project:
        _id:
          _id: '$_id'
          title: '$book.title'
        user: '$users' }
      { $unwind: '$user' }
      { $unwind: '$user.trade.requests' }
      { $project:
        _id:
          owner_id: '$user.user_id'
          request: '$user.trade.requests'
        book: '$_id' }
      lastPipe
    ]).toArray()

  book__get: ({ book_id }) ->
    res = await @db.collection(booksdb_name).findOne(_id: book_id)
    if res == null then return undefined else res
  bookowners: ({ book_id }) ->
    @db.collection('bookshelf').aggregate([
      { $match: _id: book_id }
      { $unwind: '$users' }
      { $project:
        _id:
          user_id: '$users.user_id'
          book_id: '$_id'
        trade: '$users.trade' }
      { $match: trade: $exists: 1 }
      { $lookup:
        from: 'bookshelf_users'
        localField: '_id.user_id'
        foreignField: '_id'
        as: 'loci' }
      { $unwind: '$loci' }
      { $project:
        _id: 0
        user_id: '$_id.user_id'
        book_id: '$_id.book_id'
        trade: '$trade'
        loci: '$loci.loci' }
    ]).toArray()

  market: ({ page_n }) ->
    @db_paging
      db: @db
      coll: 'bookshelf'
      query: 'users.trade': $exists: 1
      limit: 20
      page_n: page_n
      sort: 'users.trade.creation_date': -1


  notification__add: ({ user_id, info }) ->
    note =
      creation_date: new Date
      read: false
      opened: false
    if info.type == 'trade.request'
      note.path = '/book/' + info.book_id
      note.message = '@' + info.user_id + ' requests "' + info.result.book.title + '"'
    if info.type == 'trade.respond'
      note.path = info.path
      note.message = info.message
    result = await @db.collection(usersdb_name).findOneAndUpdate(
      { _id: user_id },
      { $push: notifcations: note },
      { returnOriginal: false })
    @e.emit 'notify',
      user: result.value
      note: note
    result.value

  note__mark__read: ({ note, user_id }) ->
    console.log user_id
    result = await @db.collection(usersdb_name).findOneAndUpdate(
      {
        _id: user_id
        notifcations: $elemMatch:
          creation_date: new Date(note.creation_date)
          message: note.message
      },
      { $set: 'notifcations.$.read': true },
      { returnOriginal: false })
    if result.value == null then return
    e.emit 'notify',
      user: result.value
      note: note
    result.value

  note__mark__opened: ({ note, user_id }) ->
    result = await @db.collection(usersdb_name).findOneAndUpdate(
      {
        _id: user_id
        notifcations: $elemMatch:
          creation_date: new Date(note.creation_date)
          message: note.message
      },
      {
        $set:
          'notifcations.$.opened': true
          'notifcations.$.read': true
      },
      { returnOriginal: false })
    if result.value == null then return
    console.log 'opend', result.value
    e.emit 'notify',
      user: result.value
      note: note
    result.value

