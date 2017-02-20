let examples = []
module.exports = examples

function copyJSON(obj){
  return JSON.parse(JSON.stringify( obj ))
}

// book 0
// search result for a book from google-search-api
  var book = {
    title: 'YHWH Exists',
    subtitle: 'Placing God on Trial: an Indepth Look at the Validity and Historicity of the Hebrew Scriptures',
    authors: [ 'Jodell Onstott' ],
    publishedDate: '2015-05-24',
    description: 'YHWH EXISTS has a Smyth binding, sewn in 32\'s, cased into Arrestox B House Stock, 88pt. Binders Board, 80 lb. endsheets to match rounded/backed: Archival quality.',
    industryIdentifiers:
     [ { type: 'ISBN_10', identifier: '0975337505' },
       { type: 'ISBN_13', identifier: '9780975337509' } ],
    pageCount: 1184,
    printType: 'BOOK',
    averageRating: 5,
    ratingsCount: 3,
    maturityRating: 'NOT_MATURE',
    language: 'en',
    id: 'ZLEAPQAACAAJ',
    link: 'http://books.google.co.uk/books/about/YHWH_Exists.html?hl=&id=ZLEAPQAACAAJ',
    thumbnail: 'http://books.google.com/books/content?id=ZLEAPQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    images: {}
  }


// book with owner
// database schema 1 book has many owners/readers
  var book_with_owner = {
    _id: "WghC0_Qo7iEC",
    users: [
      {
        user_id: "realDonaldTrump",
        creation_date: "2017-02-14T18:35:32.460Z"
      }
    ],
    updated: "2017-02-14T18:35:32.460Z",
    book: copyJSON(book)
  }



// book for trade
  book_for_trade = copyJSON(book_with_owner)
  book_for_trade.users[0].trade = {
    creation_date: '2017-02-15T18:35:32.460Z',
    fullfilled: false,
    requests: []
  }

// book for trade with trade req
  book_with_trade_req = copyJSON(book_for_trade)
  book_with_trade_req.users[0].trade.reqs = [
    {
      user_id: 'katieSmith', // person requesting book from owner
      creation_date: '2017-02-15T18:35:32.460Z' // when
    }
  ]

// book with trade req accepted
  book_tra = copyJSON(book_with_trade_req)
  book_tra.users[0].trade.reqs[0].accepted = true
  book_tra.users[0].trade.reqs[0].accepted_date = '2017-02-15T18:35:32.460Z'

// book with trade req declined
  book_trd = copyJSON(book_with_trade_req)
  book_tra.users[0].trade.reqs[0].declined = true
  book_tra.users[0].trade.reqs[0].declined_date = '2017-02-15T18:35:32.460Z'


examples.push(
  book,
  book_with_owner,
  book_for_trade,
  book_with_trade_req,
  book_tra,
  book_trd)
