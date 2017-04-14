module.exports = function({methods, data}) {
  data.home__reqs_sent = []
  data.home__reqs_recv = []
  data.loaded_sent = false
  data.loaded_recv = false


  methods.home__market_front = function() {
    req({
      url: '/market/1',
      json: true
    }).then(function(res){
      console.log('index.js: market loaded')
      vm.market = res.docs
    })
  }

  methods.home__reqs_get = function(){
    let vm = this
    return Promise.all([vm.home__reqs(true), vm.home__reqs(false)]).then(function(arr){
      vm.home__reqs_sent = arr[0]
      vm.home__reqs_recv = arr[1]
    })
  }

  methods.home__reqs = function(sent_or_recieved) {
    var data = {}
    let vm = this
    if (!vm.is_user){return}
    if (sent_or_recieved === true) {// requests sent
      data.user_id = vm.user._id
    }
    if (sent_or_recieved === false) {// requests recieved
      data.owner_id = vm.user._id
    }
    return req({
      url: '/trade_requests__get',
      method: 'post',
      data,
      json: true
    })
  }

  methods.req__accept = function(req, bool) {
    var word = bool ? 'ACCEPT' : 'DECLINE'
    var msg = `Are you sure you want to ${word} @${req._id.owner_id} request for "${req.book.title}"?`
    var a = confirm(msg)
    if (a === false) {return}
    w.req({
      url: '/trade_respond',
      method: 'post',
      json: true,
      data: {request: req, accept_or_decline: bool}
    })
    // sent request to server
    // notify the client
  }
  methods.req_class = function(request){
    let vm = this
    var o = {}
    var a = vm.req__trade_status(request)
    o[a.toLowerCase()] = true
    return o
  }


  w.comms.on('message', function(e){
    console.log('home',e)
    if (!vm){return}
    if (e.cmd === 'book.update'){
      if (vm.sb._id === e.book._id) {
        vm.sb = e.book
      }
      var a= [vm.bookshelf, vm.market]
      a.map(function(shelf){
        var i = shelf.findIndex(function(book){
          return book._id === e.book._id
        })
        if (i !== -1){
          shelf[i] = e.book
        }
        return {shelf: shelf, i}
      })
      a.map(function(shelf){
        if (shelf.i === -1) {
          if (vm.is_book_for_trade(e.book)) {// book for trade
            vm.market.unshift(e.book)
          }
          if (vm.is_user_book_owner(e.book)) {// user book owner
            vm.bookshelf.unshift(e.book)
          }
        }
      })
      console.log('do something...')
    }
  })

  methods.is_user_book_owner = function(book){
    let vm = this
    if (!vm.is_user || book.users === undefined) {return false}
    var i = book.users.findIndex(function(user){
      return user.user_id === vm.user._id
    })
    return i > -1
  }

  methods.is_book_for_trade = function(book){
    if (book.users === undefined){return false}
    var i = book.users.find(function(user){
      if (!user.trade) {return false}
      if (user.trade) {return true}
    })
    if (i > -1){
      return true
    }
  }
}
