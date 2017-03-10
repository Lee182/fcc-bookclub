// https://apps.twitter.com/app/new
const logtwit = require('login-with-twitter')

module.exports = function({dao, port, coll_name, consumerKey, consumerSecret, callbackUrl}) {


const tw = new logtwit({
  consumerKey,
  consumerSecret,
  callbackUrl
})

_tw_tokens = {}
function login(req,res,next){
  tw.login(function(err, tokenSecret, url){
    // console.log('tw.login', err, tokenSecret, url)
    if (err) {
      return res.redirect('/')
    }
    var oauth_token = url.split('oauth_token=')[1]
    _tw_tokens[oauth_token] = tokenSecret
    res.redirect(url)
  })
}

function login_cb(req, res, next){
  var oauth_token = req.query.oauth_token
  var oauth_token_secret = _tw_tokens[oauth_token]
  if (oauth_token_secret === undefined) {
    req.twerr = 'no oauth_token_secret'
    return next()
  }
  tw.callback({
    oauth_token,
    oauth_verifier: req.query.oauth_verifier
  },
  oauth_token_secret,
  function(err, user){
    // console.log('tw.callback', err, user)

    if (err) {return}
    delete _tw_tokens[oauth_token]
    res.cookie('twitter', user.userToken,
      {expires: new Date(Date.now()+(1000*60*60*24*360)), httpOnly: true})
    dao.db.collection(coll_name)
      .findOneAndUpdate({
        _id: user.userToken,
      },
      {$set: {
        creation_date: new Date(),
        user_id: user.userName
        // https://twitter.com/${userName}/profile_image
      }},
      {upsert: true, returnOriginal: false})
      .then(function(result){
        req.twuser = user.userName
        next()
      })
      .catch(function(err){
        // console.log(err.message)
        return next()
      })
  })
}

function logout(req, res, next){
  // console.log('tw.logout',req.cookies)
  dao.db.collection(coll_name).remove({
    _id: req.cookies.twitter
  }).then(function(a){
    // console.log(a.result.n, 'removed session')
  })
  res.clearCookie('twitter', { path: '/' })
  res.json({logout: true})
}

function is_logged_in(req, res, next){
  if (req.cookies === undefined || req.cookies.twitter === undefined) {
    return res.sendStatus(400)
  }
  dao.db.collection(coll_name).findOne({
    _id: req.cookies.twitter,
  }).then(function(result){
    if (result === null){
      result = undefined
      res.clearCookie('twitter', { path: '/' })
    }
    if (result) {
      req.twuser = result.user_id
    }
    next()
  }).catch(function(err){
    // console.log('tw error:')
    next()
  })
}

/* Usage
app.get('/twitter', twlogin)
  // populates req.twerr
  // redirects user to twitter.com
app.get('/twitter-callback', twlogin_cb)
  // populates req.twuser or req.twerr
app.post('/twitter-logout')
  // clears the twitter cookie
*/
return {
  login,
  login_cb,
  logout,
  is_logged_in
}


}
