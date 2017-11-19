handle_user_connects = require('server/ws/user_connect_disconnect_handle')
Comms = require('server/ws/comms.server')

module.exports = ({
  app,
  server,
  cookie_parser,
  tw,
  dao
}) ->
  comms = Comms(server)
  users_online = []

  get_user = (ws, user_id) ->
    users_online.find (a) ->
      a.ws == ws

  get_user__comms = (user_id) ->
    users_online.filter (a) ->
      a.user_id == user_id

  user_auth = (o, user_id) ->
    user_id != undefined and
    user_id != null and
    o.user_id != undefined and
    o.user_id != null and
    o.user_id == user_id

  handle_user_connects({ comms, cookie_parser, tw, users_online })
  comms.on 'request', ({ data, ws }) ->
    # for handling req response
    # console.log('comms.request', data)
    # example helloworld
    a = get_user(ws)
    b = data.data
    if b.cmd == 'hello_world'
      message = ''
      if a.user_id == undefined
        message = 'Hello! says mister express+ws server'
      if a.user_id != undefined
        message = 'Hello ' + a.user_id + '! hope your having a great time'
      # send as a response
      comms.send
        ws: ws
        data:
          req_res: data.req_res
          data: message: message

  comms.on 'message', ({ data, ws }) ->
    console.log 'data', data
    user = get_user(ws)
    valid_user = user_auth(user, data.user_id)

  dao.e.on 'notify', (data) ->
    channels = get_user__comms(data.user._id)
    channels.forEach (channel) ->
      comms.send
        ws: channel.ws
        data: data

  dao.e.on 'book.update', (book) ->
    comms.sendAll
      book: book
      cmd: 'book.update'

  { users_online, comms }
