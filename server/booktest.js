var books = require('google-books-search')

books.search('Yhwh Exists', function(err, results) {
  if (err) {
    console.log(err)
    return
  }
  console.log(results[0])
})
