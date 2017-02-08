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


server.listen(port, function(){
  console.log('server listening at http://localhost:'+port)
})
