module.exports = function ({app, dao, port, k, sessiondb_name}) {
  const tw = require('./twitter_session.js')({
    dao,
    port,
    coll_name: sessiondb_name,
    consumerKey: k.twitter.consumerKey,
    consumerSecret: k.twitter.consumerSecret,
    callbackUrl: 'https://booktrade.blogjono.com/tw.login_cb'
  })
  app.get('/tw.login', tw.login)
  app.get('/tw.login_cb', tw.login_cb, function (req, res, next) {
    console.log(req.twuser)
    if (req.twuser === undefined) {
      return res.redirect('/')
    }
    dao.user__findOne({user_id: req.twuser})
      .then(function (user) {
        if (user === undefined) {
          return dao.user__add({user_id: req.twuser})
        }
        return user
      })
      .then(function (user) {
        if (user.loci === undefined) {
          return dao.user__add_loci_fromip({user_id: user._id, ip: req.ip})
        }
        return user
      })
      .then(function (user) {
        console.log(user)
        res.redirect(`/?user_id=${req.twuser}`)
      })
  })
  app.post('/tw.logout', tw.logout)

  app.get('/user', tw.is_logged_in, function (req, res, next) {
    dao.user__findOne({user_id: req.twuser}).then(function (user) {
      return res.json(user)
    })
  })
  app.post('/user/:user_id', function (req, res) {
    dao.user__findOne({user_id: req.params.user_id}).then(function (user) {
      if (user === undefined) {
        res.json({err: 'notfound'})
      }
      return res.json(user)
    })
  })

  app.post('/user_loci__change', tw.is_logged_in, function (req, res, next) {
    dao.user__change_loci({
      user_id: req.twuser,
      loci: req.body.loci
    }).then(function (result) {
      res.json(result)
    })
  })

  return tw
}
