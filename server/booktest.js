var books = require('google-books-search')

// books.search('Yhwh Exists', function(err, results) {
//   if (err) {
//     console.log(err)
//     return
//   }
//   console.log(results[0])
// })


books.lookup('9KJJYFIss_wC', function(error, result) {
  console.log('\n books.lookup', error, result)
})
