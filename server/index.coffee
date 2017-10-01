import http  from 'http'
import path  from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express_user from './express/user'
import express_book from './express/book'
import ws_handle from './ws/index'
import k  from './keys'
import db from './db'

app = express()
server = http.Server(app)
port = process.argv[2] or 3000
cookie_parser = cookieParser()
body_parser_json = bodyParser.json()

dao = new db({ mongourl: k.mongourl })
app.use cookie_parser
app.use body_parser_json
app.use '/', express.static(path.resolve(__dirname + '/../dist'))

tw = express_user({ app, port, dao, k, 'bookclub_sessions' })
bookapi = express_book({ app, dao })
ws = ws_handle({ app, server, cookie_parser, tw, dao })

app.get '*', (req, res) ->
  res.sendFile path.resolve(__dirname + '/../dist/index.html')

dao.connect().then ->
  server.listen port, ->
    console.log 'server listening at http://localhost:' + port