my_book = JSON.parse(JSON.stringify( require('./my_book.js') ))
my_book.users[0].trade = {
  creation_date: "2017-02-15T18:35:32.460Z",
  accepted: false
}

module.exports = my_book
