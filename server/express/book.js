const bookapi = require('../api/book.js')

module.exports = function({app, dao}) {
  app.get('/book_search/:query/:pagenum', function(req,res){
    if (typeof req.params.query !== 'string') {
      return res.status(400)
    }
    var pagenum = Number(req.params.pagenum) - 1
    bookapi.find(req.params.query, pagenum).then(function(data){
      res.json(data)
    }).catch(function(err){
      console.log('express book_search', err)
      res.status(400)
    })
  })
  app.get('/book_id/:book_id', function(req,res,next){
    dao.book__get({book_id: req.params.book_id}).then(function(data){
      if (data) {
        return res.json(data)
      }
      bookapi.findId(req.params.book_id).then(function(data){
        res.json(data)
      })
    })

  })
  app.get('/bookshelf/:user_id', function(req,res,next){
    dao.bookshelf({user_id: req.params.user_id}).then(function(result){
      res.json(result)
    })
  })
  app.get('/tradeshelf/:user_id', function(req,res,next){
    dao.tradeshelf({user_id: req.params.user_id}).then(function(result){
      res.json(result)
    })
  })

  app.get('/bookowners/:book_id', function(req, res, next){
    dao.bookowners({book_id: req.params.book_id})
    .then(function(result){
      res.json(result)
    })
  })

  app.get('/market/:page_n', function(req, res, next){
    dao.market({page_n: req.params.page_n}).then(function(result){
      res.json(result)
    })
  })



  var endpoints = [
    'bookshelf__add',
    'bookshelf__remove',
    'trade__list',
    'trade__unlist',
    'trade__request',
    'trade__request_remove',
    'note__mark__read',
    'note__mark__opened',
    'trade_requests__get',
    'trade_respond'
  ]

  endpoints.forEach(function(name){
    app.post('/'+name, function(req, res, next){
      dao[name](req.body)
      .then(function(result){
        res.json(result)
      })
      .catch(function(err){
        console.log(err)
        res.json({err, err_req: req.body})
      })
    })
  })
  return bookapi
}
