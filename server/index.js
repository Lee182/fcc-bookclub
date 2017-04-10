const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const server = http.Server(app)
const port = process.argv[2] || 3000

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookie_parser = cookieParser()
const express_user = require('./express/user.js')
const express_book = require('./express/book.js')

const ws_handle = require('./ws/index.js')

var k = require('./keys.js')
var dao = require('./db.js')({ mongourl: k.mongourl })

app.use( cookie_parser )
app.use( bodyParser.json() )
app.use('/',
  express.static(path.resolve(__dirname + '/../dist')) )

const tw = express_user({app, port, dao, k,
  sessiondb_name: 'bookclub_sessions'})
const bookapi = express_book({app, dao})

const ws = ws_handle({app, server, cookie_parser, tw, dao})
app.get('*', function(req,res,next){
  // send / page for all over requests
  // TODO 404 page
  res.sendFile(path.resolve(__dirname + '/../dist/index.html') )
})

dao.connect().then(function(){
  server.listen(port, function(){
    console.log('server listening at http://192.168.1.12:'+port)
  })
})
