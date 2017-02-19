var books = require('google-books-search')
var o = {}

o.find = function(query, pagenum){
  if (isNaN(pagenum)) {pagenum = 0}
  var limit = 20
  var offset = limit * pagenum
  var options = {
    // key: "YOUR API KEY",
    // field: 'title',
    offset,
    limit,
    type: 'books',
    order: 'relevance',
    lang: 'en'
  }
  return new Promise(function(resolve, reject){


  books.search(query, options, function(err, books, apires) {
    if (err) { return reject({err}) }
    var count = offset+limit
    if (apires !== undefined && apires.totalItems !== undefined) {
      count = apires.totalItems
    }
    return resolve({
      books,
      query,
      pagenum: pagenum+1,
      pages: Math.ceil(count / limit),
    })
  })

  })
}

o.findId = function(id) {
  return new Promise(function(resolve, reject){

  books.lookup(id, function(err, book) {
    if (err || book === undefined) {
      console.log('db.js my_books__add err:', err)
      return reject({err_msg: 'book_id not found', err})
    }
    return resolve(book)
  })

  })
}

o.nodeapi = books

module.exports = o
