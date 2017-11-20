import http  from 'http'
import path  from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express_user from 'server/express/user.coffee'
import express_book from 'server/express/book.coffee'
import ws_handle from 'server/ws/index.coffee'
import k  from 'server/keys.coffee'
import db from 'server/db.coffee'

sNow = new Date().toISOString()
console.log("server started #{sNow}")

app = express()
server = http.Server(app)
port = process.argv[2] or 3000
cookie_parser = cookieParser()
body_parser_json = bodyParser.json()

dao = new db({ mongourl: k.mongourl })
app.use cookie_parser
app.use body_parser_json
app.use '/', express.static(path.resolve(__dirname + '/dist'))

tw = express_user({ app, port, dao, k, 'bookclub_sessions' })
bookapi = express_book({ app, dao })
ws = ws_handle({ app, server, cookie_parser, tw, dao })

app.get '*', (req, res) ->
  res.sendFile path.resolve(__dirname + '/dist/index.html')

dao.connect().then ->
  server.listen port, ->
    console.log 'server listening at http://localho.st:' + port