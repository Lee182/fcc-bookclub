var express = require('express')
var app = express()
var http = require('http')
var path = require('path')
var server = http.Server(app)
var port = process.env.PORT || 3000
var bodyParser = require('body-parser')


app.use( require('cookie-parser')() )
app.use( bodyParser.json() )
app.use('/',
  express.static(path.resolve(__dirname + '/../dist')))


var k = require('./keys.js')
var dao = require('./db.js')({
  mongourl: k.mongourl,
})

dao.connect()


var tw = require('./twitter-session')({
  dao,
  port,
  coll_name: 'bookclub_sessions',
  consumerKey: k.twitter.consumerKey,
  consumerSecret: k.twitter.consumerSecret,
  callbackUrl: 'http://localhost:3000/tw.login-cb'
})

app.get('/tw.login', tw.login)
app.get('/tw.login_cb', tw.login_cb, function(req,res,next){
  if (req.twuser === undefined) {
    return res.redirect('/')
  }
  dao.user__findOne({user_id: req.twuser})
    .then(function(user){
      if (user === undefined) {
        return dao.user__add({user_id: req.twuser})
      }
    })
    .then(function(user){
      if (user.loci === undefined) {
        return dao.user__add_loci_fromip({user_id: user._id, ip: req.ip})
      }
      return user
    })
    .then(function(user){
      console.log(user)
      res.redirect(`/?user_id=${req.twuser}`)
    })
})
app.post('/tw.logout', tw.logout)

app.get('/user_id', tw.is_logged_in, function(req,res,next){
  dao.user__findOne({user_id: req.twuser}).then(function(user){
    return res.json(user)
  })
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

function passToBookDB(method) {
  return function(req, res, next) {
    console.log('dao.bookshelf',method)
    dao[method](req.body)
    .then(function(result){
      res.json(result)
    })
    .catch(function(err){
      res.json({err, err_req: req.body})
    })
  }
}

app.get('/bookshelf/:user_id', function(req,res,next){
  dao.bookshelf({user_id: req.params.user_id}).then(function(result){
    res.json(result)
  })
})

app.post('/bookshelf__add', passToBookDB('bookshelf__add'))
app.post('/bookshelf__remove', passToBookDB('bookshelf__remove'))
app.post('/trade__list', passToBookDB('trade__list'))
app.post('/trade__unlist', passToBookDB('trade__unlist'))
app.post('/trade__request', passToBookDB('trade__request'))
app.post('/trade__request_remove', passToBookDB('trade__request'))


app.get('*', function(req,res,next){
  res.sendFile(path.resolve(__dirname + '/../dist/index.html') )
})

server.listen(port, function(){
  console.log('server listening at http://localhost:'+port)
})
