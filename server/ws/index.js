const handle_user_connects = require('./user_connect_disconnect_handle.js')
const Comms = require('./comms.server.js')

module.exports = function({app, server, cookie_parser, tw, dao}) {
  const comms = Comms(server)

  var users_online = []
  function get_user(ws, user_id) {
    return users_online.find(function(a){
      return a.ws === ws
    })
  }
  function get_user__coms(user_id) {
    return users_online.filter(function(a){
      return a.user_id === user_id
    })
  }
  function user_auth(o, user_id) {
    return user_id !== undefined && user_id !== null &&
      o.user_id !== undefined && o.user_id !== null &&
      o.user_id === user_id
  }

  handle_user_connects({
    comms,
    cookie_parser,
    tw,
    users_online
  })

  comms.on('request', function({data, ws}){
    // for handling req response
    // console.log('comms.request', data)

    // example helloworld
    var a = get_user(ws)
    var b = data.data
    if (b.cmd === 'hello_world') {
      var message = ''
      if (a.user_id === undefined) {
        message = 'Hello! says mister express+ws server'
      }
      if (a.user_id !== undefined) {
        message = 'Hello '+a.user_id+'! hope your having a great time'
      }
      // send as a response
      comms.send({ws, data: {req_res: data.req_res,
        data: {message}
      }})
      return
    }

  })

  comms.on('message', function({data, ws}){
    console.log('data', data)
    var user = get_user(ws)
    var valid_user = user_auth(user, data.user_id)
  })

  return {users_online, comms}
}
