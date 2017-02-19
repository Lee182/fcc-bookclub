module.exports = function({data, methods, computed, watch}) {
  data.my_trade__filter_term = ''

  methods.trade__list = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/trade__list',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.bookshelf__update(res.value)
    })
  }

  methods.trade__unlist = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/trade__unlist',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.bookshelf__update(res.value)
    })
  }

  methods.trade__req = function(book_id, user_id) {
    // sent POST trade__req
  }

  methods.trade__req_remove = function(book_id, user_id){
    // send POST trade__req
    // update obj
  }


  methods.is_tradeable = function(book_id) {
    let vm = this
    var i = vm.bookshelf__findId(book_id)
    if (i === -1) {return false}
    var i2 = vm.bookshelf[i].users.findIndex(function(o){
      return o.user_id === vm.user_id
    })
    if (i2 === -1) {return false}
    return vm.bookshelf[i].users[i2].trade !== undefined
  }

  methods.books_for_trade = function() {
    let vm = this
    return vm.bookshelf.filter(function(b){
      return vm.is_tradeable(b.book.id)
    })
  }
}
