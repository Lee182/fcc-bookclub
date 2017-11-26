bookapi = require('server/api/book')

module.exports = ({ app, dao }) ->

  app.get '/book_search/:query/:pagenum', (req, res) ->
    if typeof req.params.query != 'string'
      return res.status(400)
    pagenum = Number(req.params.pagenum) - 1
    try
      data = await bookapi.find(req.params.query, pagenum)
      res.json data
    catch err
      console.log 'express book_search', err
      res.status 400

  app.get '/book_id/:book_id', (req, res, next) ->
    data = await dao.book__get(book_id: req.params.book_id)
    if data
      return res.json data
    data = await bookapi.findId(req.params.book_id)
    res.json data

  app.get '/bookshelf/:user_id', (req, res, next) ->
    result = await dao.bookshelf(user_id: req.params.user_id)
    res.json result

  app.get '/tradeshelf/:user_id', (req, res, next) ->
    result = await dao.tradeshelf(user_id: req.params.user_id)
    res.json result

  app.get '/bookowners/:book_id', (req, res, next) ->
    result = await dao.bookowners(book_id: req.params.book_id)
    res.json result

  app.get '/market/:page_n', (req, res, next) ->
    result = await dao.market(page_n: req.params.page_n)
    res.json result

  endpoints = [
    'bookshelf__add'
    'bookshelf__remove'
    'trade__list'
    'trade__unlist'
    'trade__request'
    'trade__request_remove'
    'note__mark__read'
    'note__mark__opened'
    'trade_requests__get'
    'trade_respond'
  ]
  endpoints.forEach (name) ->
    app.post '/' + name, (req, res, next) ->
      try
        result = await dao[name] req.body
        res.json result
      catch err
        console.log err
        res.json
          err: err
          err_req: req.body
  bookapi