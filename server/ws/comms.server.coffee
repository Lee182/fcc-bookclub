WebSocket = require('uws')
# const BSON = require('bson')
# const bson = new BSON()
eve = require('../../app/browser+node/eventSystem.js')
# http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
# function ArrayBuffertoBuffer(ab) {
#   var buf = new Buffer(ab.byteLength)
#   var view = new Uint8Array(ab)
#   for (var i = 0; i < buf.length; ++i) {
#     buf[i] = view[i]
#   }
#   return buf
# }
# ws code

sendBSON = ({ ws, data }) ->
  if ws.readyState == WebSocket.OPEN
    ws.send JSON.stringify(data)
    # ws.send( bson.serialize(data, {ignoreUndefined: false}))

module.exports = (server) ->
  e = eve()
  o = {}
  wss = new (WebSocket.Server)(server: server)
  wss.on 'connection', (ws) ->
    e.emit 'connection', ws
    ws.on 'message', (data, flags) ->
      conn = this
      try
        data = JSON.parse(data)
        # data = bson.deserialize(ArrayBuffertoBuffer(data))
        if typeof data.req_res == 'number'
          e.emit 'request', { data, ws: conn }
        e.emit 'message', { data, ws: conn }
      catch err
    ws.on 'close', ->
      e.emit 'close', ws

  o.send = sendBSON

  o.sendAll = (data) ->
    wss.clients.forEach (ws) ->
      sendBSON
        ws: ws
        data: data

  o.sendAllExcept = ({ ws, data }) ->
    wss.clients
    .filter (client) ->
      client == ws
    .map (client) ->
      sendBSON
        ws: client
        data: data

  o.wss = wss
  o.on = e.on
  o.off = e.off
  o

###
comms.on('connection', ws)
comms.on('close', ws)
comms.on("message", {data, ws})

comms.send({ws, data})
comms.sendAll(data)
comms.sendAllBut({ws, data})
###