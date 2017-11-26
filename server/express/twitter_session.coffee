'use strict'
# https://apps.twitter.com/app/new
logtwit = require('login-with-twitter')
es = require('shared/eventSystem.js')

module.exports = ({
  dao,
  port,
  coll_name,
  consumerKey,
  consumerSecret,
  callbackUrl
}) ->
  if typeof coll_name != 'string'
    return throw new Error()
  events = es()
  tw = new logtwit({ consumerKey, consumerSecret, callbackUrl })
  _tw_tokens = {}

  out =
    events: events
    login: (req, res, next) ->
      console.log('login')
      tw.login (err, tokenSecret, url) ->
        # console.log('tw.login', err, tokenSecret, url)
        if err
          return res.redirect('/')
        oauth_token = url.split('oauth_token=')[1]
        _tw_tokens[oauth_token] = tokenSecret
        res.redirect url

    login_cb: (req, res, next) ->
      oauth_token = req.query.oauth_token
      oauth_token_secret = _tw_tokens[oauth_token]
      if oauth_token_secret == undefined
        req.twerr = 'no oauth_token_secret'
        return next()
      tw.callback {
        oauth_token: oauth_token
        oauth_verifier: req.query.oauth_verifier
      }, oauth_token_secret, (err, user) ->
        # console.log('tw.callback', err, user)
        if err
          return next(err)
        delete _tw_tokens[oauth_token]
        res.cookie 'twitter', user.userToken,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 360)
          httpOnly: true
        
        
        query = _id: user.userToken
        update =
          $set:
            creation_date: new Date
            user_id: user.userName
        options = upsert: true, returnOriginal: false
        
        result = await dao.db
          .collection(coll_name)
          .findOneAndUpdate(query, update, options)
        console.log 'tw', result
        req.twuser = user.userName
        next()

    logout: (req, res, next) ->
      # console.log('tw.logout',req.cookies)
      events.emit 'logout',
        user_id: req.twuser
        req: req
      await dao.db.collection(coll_name).remove(_id: req.cookies.twitter)
      res.clearCookie 'twitter', path: '/'
      res.json logout: true

    is_logged_in: (req, res, next) ->
      if not req.cookies or not req.cookies.twitter
        return res.status(400).send('jog on')
      try
        result = await out.is_logged_in_prom(req.cookies.twitter)
        if result == undefined
          return res.clearCookie('twitter', path: '/')
        req.twuser = result.user_id
        next()
      catch
        next()

    is_logged_in_prom: (cookie) ->
      result = await dao.db.collection(coll_name).findOne(_id: cookie)
      if result == null then {} else result
  out

### Usage
app.get('/twitter', tw.login)
  // populates req.twerr
  // redirects user to twitter.com
app.get('/twitter-callback', tw.login_cb)
  // populates req.twuser or req.twerr
  // stores data in mongodb collection
app.post('/twitter-logout')
  // clears the twitter cookie
###