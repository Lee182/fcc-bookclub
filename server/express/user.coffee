Twitter_session = require('server/express/twitter_session.coffee')

module.exports = ({ app, dao, port, k, sessiondb_name }) ->
  tw = Twitter_session({
    dao,
    port,
    coll_name: sessiondb_name
    consumerKey: k.twitter.consumerKey
    consumerSecret: k.twitter.consumerSecret
    callbackUrl: k.twitter.callbackUrl })

  app.get '/tw.login', tw.login
  
  app.post '/tw.logout', tw.logout

  app.get '/tw.login_cb', tw.login_cb, (req, res, next) ->
    console.log req.twuser
    if !req.twuser then return res.redirect '/'
    user = await dao.user__findOne(user_id: req.twuser)
    if !user
      user = await dao.user__add(user_id: req.twuser)
    if !user.loci
      user = await dao.user__add_loci_fromip(user_id: user._id, ip: req.ip)
    res.redirect '/?user_id=' + req.twuser


  app.get '/user', tw.is_logged_in, (req, res, next) ->
    try
      user = await dao.user__findOne(user_id: req.twuser)
      res.json user
    catch err
      res.status(500).send()
      debugger

  app.post '/user/:user_id', (req, res) ->
    user = await dao.user__findOne(user_id: req.params.user_id)
    if !user
    then res.json err: 'notfound'
    else res.json user

  app.post '/user_loci__change', tw.is_logged_in, (req, res, next) ->
    result = await dao.user__change_loci(user_id: req.twuser, loci: req.body.loci)
    res.json result

  tw