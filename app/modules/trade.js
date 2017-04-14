module.exports = function({data, methods, computed, watch}) {
  data.my_trade__search_term = ''

  methods.trade__list = function(book_id) {
    let vm = this
    if (!vm.is_user) {return}
    w.req({
      method: 'post',
      url: '/trade__list',
      data: {book_id, user_id: vm.user._id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.bookshelf__update(res.value)
    })
  }

  methods.trade__unlist = function(book_id) {
    let vm = this
    if (!vm.is_user) {return}
    w.req({
      method: 'post',
      url: '/trade__unlist',
      data: {book_id, user_id: vm.user._id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.bookshelf__update(res.value)
    })
  }


  data.books_for_trade = []

  methods.trade__request = function(book_id, owner_id) {
    let vm = this
    if (!vm.is_user) {return}
    console.log(book_id, owner_id)
    w.req({
      method: 'post',
      url: '/trade__request',
      data: {book_id, owner_id, user_id: vm.user._id},
      cookies: true,
      json: true
    }).then(function(res){
      console.log('trade__request',res)
    })
  }

  methods.trade__respond = function(book_id, trade_response, user_id) {
    if (trade_response !== 'accepted'
    || trade_response !== 'declined') {return}
    // let a = limit(trade_response, ['accepted', 'declined'])
    // if (a.invalid) {return}
    w.req({
      method: 'post',
      url: '/trade__response',
      data: {book_id, user_id, trade_response}
    })
  }

  methods.trade__get_reqs_sent = function() {
    let vm = this
  }

  methods.trade__update = function(book_id, user_id) {
    // splicing
  }
  methods.trade__long_poll = function() {

  }



  methods.trade__req_remove = function(book_id, user_id){
    // user_id is the book_id owner
    // send POST trade__req
    // update obj
  }


  methods.is_tradeable = function(book_id) {
    let vm = this
    var i = vm.bookshelf__findId(book_id)
    if (i === -1) {return false}
    if (vm.is_user === false) {return false}
    var i2 = vm.bookshelf[i].users.findIndex(function(o){
      return o.user_id === vm.user._id
    })
    if (i2 === -1) {return false}
    return vm.bookshelf[i].users[i2].trade !== undefined
  }

  methods.tradeshelf = function() {
    let vm = this
    return vm.bookshelf.filter(function(b){
      return vm.is_tradeable(b.book.id)
    })
  }
}
