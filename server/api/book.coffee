books = require('google-books-search')
o = {}

o.find = (query, pagenum) ->
  if isNaN(pagenum)
    pagenum = 0
  limit = 20
  offset = limit * pagenum
  options =
    key: 'AIzaSyCbv-II5YI9rpxNNsUSSGmRfr_p7GlXmGE'
    offset: offset
    limit: limit
    type: 'books'
    order: 'relevance'
    lang: 'en'
  new Promise (resolve, reject) ->
    books.search query, options, (err, books, apires) ->
      if err
        return reject(err: err)
      count = offset + limit
      if apires != undefined and apires.totalItems != undefined
        count = apires.totalItems
      resolve
        books: books
        query: query
        pagenum: pagenum + 1
        pages: Math.ceil(count / limit)

o.findId = (id) ->
  new Promise((resolve, reject) ->
    books.lookup id, (err, book) ->
      if err or book == undefined
        console.log 'db.js bookshelf__add err:', err
        return reject(
          err_msg: 'book_id not found'
          err: err)
      resolve book
    return
)

o._api = books
module.exports = o