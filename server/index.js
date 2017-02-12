var express = require('express')
var app = express()
var http = require('http')
var path = require('path')
var server = http.Server(app)
var port = process.env.PORT || 3000
var bodyParser = require('body-parser')


app.use( require('cookie-parser')() )
app.use( bodyParser.json() )
// app.use(function(req,res,next){
//   console.log(req.path, req.cookies)
//   next()
// })
app.use('/',
  express.static(path.resolve(__dirname + '/../dist')))


var k = require('./keys.js')
var dao = require('./db.js')({
  mongourl: k.mongourl,
  coll_name: 'bookclub'
})

dao.connect()


var tw_session = require('./twitter-session')({
  dao, port, coll_name: 'bookclub_sessions'})

app.get('/twitter', tw_session.twlogin)
app.get('/twitter-callback', tw_session.twlogin_cb, function(req,res,next){
  console.log('/twitter-callback', req.cookies, req.twuser)
  if (req.twuser === undefined) {
    clearCooks(res)
    return res.redirect('/')
  }
  res.redirect(`/?user_id=${req.twuser}`)
})
app.get('/user_id', tw_session.tw_is_logged_in, function(req,res,next){
  res.json({user_id:req.twuser})
})



var books = require('google-books-search')

app.get('/book_search/:query/:pagenum', function(req,res){
  if (typeof req.params.query !== 'string') {
    return res.status(400)
  }
  var pagenum = Number(req.params.pagenum) - 1
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
  books.search(req.params.query, options, function(err, books, apires) {
    if (err) {
      return res.json({err})
    }
    if (apires === undefined) {
      apires = {}
    }
    if (apires.totalItems === undefined) {
      apires.totalItems =  offset+limit
    }
    return res.json({
      books,
      query: req.params.query,
      pagenum: pagenum+1,
      pages: Math.ceil(apires.totalItems / limit),
    })
  })
})


server.listen(port, function(){
  console.log('server listening at http://localhost:'+port)
})
