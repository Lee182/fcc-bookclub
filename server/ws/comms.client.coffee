# BSON code is commented
# const BSON = require('bson')
# const bson = new BSON()
eventSystem = require('#/app/browser+node/eventSystem.js')

# BlobtoJSON = (blob) ->
#   new Promise (resolve, reject) ->
#     reader = new FileReader
#     reader.readAsArrayBuffer blob
#     reader.on 'loadend', ->
#       data = bson.deserialize(ArrayBuffertoBuffer(reader.result))
#       resolve data

# ArrayBuffertoBuffer = (ab) ->
#   buf = new Buffer(ab.byteLength)
#   view = new Uint8Array(ab)
#   i = 0
#   while i < buf.length
#     buf[i] = view[i]
#     ++i
#   buf
class ClientComms
  constructor: (url) ->
    # example url 'ws://localhost:3000'
    @url = url
    @e = eventSystem()
    @ws = null
    @reqs_made = {}
    @connect()
    @on = @e.on

  connect: ->
    @ws = new WebSocket(@url)

    @ws.on 'open', ->
      @e.emit 'connection'

    @ws.on 'close', ->
      @e.emit 'close'

    @ws.on 'message', (ws_event) ->
      data = JSON.parse(ws_event.data)
      if typeof data.req_res == 'string'
        @reqs_made[data.req_res].resolve data.data
        delete @reqs_made[ws_event.data.req_res_rand]
      @e.emit 'message', data
      # if (ws_event.data.toString() !== '[object Blob]') {return}
      # BlobtoJSON(ws_event.data).then(function(data){
      #   e.emit('message', data)
      # })

  reconnect: ->
    if @ws then @ws.close()
    @connect()

  send: (data) ->
    @ws.send JSON.stringify(data)
    # o.ws.send( bson.serialize(data, {ignoreUndefined: false}) )

  # req res http pattern
  req: (data) ->
    new Promise (resolve, reject) ->
      rand = Date.now() + '-' + Math.random()
      reqs_made[rand] =
        req_data: data
        resolve: resolve
        reject: reject
        res_data: undefined
      @send
        req_res: rand
        data: data

# api usage
# comms.send
# comms.on('connection')
# comms.on('message')
# comms.on('close')
# comms.reconnect()