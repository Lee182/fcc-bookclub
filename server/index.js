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


var bookapi = require('./bookapi.js')
app.get('/book_search/:query/:pagenum', function(req,res){
  if (typeof req.params.query !== 'string') {
    return res.status(400)
  }
  var pagenum = Number(req.params.pagenum) - 1
  bookapi.find(req.params.query, pagenum).then(function(data){
    res.json(data)
  }).catch(function(err){
    console.log('express book_search', err)
    res.status(400)
  })
})

app.get('/my_books/:user_id', function(req,res,next){
  dao.my_books({user_id: req.params.user_id}).then(function(result){
    res.json(result)
  })
})

app.post('/my_books__add', function(req,res,next){
  dao.my_books__add(req.body).then(function(result){
    res.json(result)
  })
})

app.post('/my_books__remove', function(req,res,next){
  dao.my_books__remove(req.body).then(function(result){
    res.json(result)
  })
})

app.post('/my_trade__add', function(req,res,next){
  dao.my_trade__add(req.body).then(function(result){
    res.json(result)
  })
})
app.post('/my_trade__remove', function(req,res,next){
  dao.my_trade__remove(req.body).then(function(result){
    res.json(result)
  }).catch(function(err){
    res.json({err})
  })
})

server.listen(port, function(){
  console.log('server listening at http://localhost:'+port)
})
