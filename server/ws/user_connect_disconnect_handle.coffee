module.exports = ({ comms, tw, cookie_parser, users_online }) ->
  cook_p = (req) ->
    new Promise (resolve) ->
      # req.headers.cookies
      cookie_parser req, {}, ->
        resolve req.cookies

  comms.on 'connection', (ws) ->
    console.log 'comm.connection', ws._socket.remotePort
    # ip === ws._socket.remoteAddress
    # add nome to a list
    users_online.push
      ws: ws
      user_id: undefined
    headers = ws.upgradeReq.headers
    cookies = await cook_p(ws.upgradeReq)
    if cookies.twitter == undefined
      comms.send({ ws, data: user_id: null })
      return
    { user_id } = await tw.is_logged_in_prom(cookies.twitter)
    if user_id == undefined
      comms.send
        ws: ws
        data: user_id: null
      return
    i = users_online.findIndex((o) -> ws == o.ws)
    if i > -1
      users_online[i].user_id = user_id
    comms.send
      ws: ws
      data: user_id: user_id

  comms.on 'close', (ws) ->
    # remove from list
    i = users_online.findIndex((o) -> ws == o.ws)
    console.log 'comm.closed', users_online[i].user_id
    users_online.splice i, 1

  # used for live updating browser tabs when login or login
  tw.events.on 'logout', (user) ->
    console.log 'tw.logut', user
    comms.sendAll reconnect: true

  tw.events.on 'login', ->
    # give, 1s for twitter, 1s for browsers to set cookies
    setTimeout (-> comms.sendAll reconnect: true), 2000