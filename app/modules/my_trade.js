module.exports = function({data, methods, computed, watch}) {
  data.my_trade__filter_term = ''

  methods.my_trade__add = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/my_trade__add',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.my_books__update(res.value)
    })
  }

  methods.my_trade__remove = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/my_trade__remove',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.my_books__update(res.value)
    })
  }

  methods.my_trade__is_tradeable = function(book_id) {
    let vm = this
    var i = vm.my_books__findId(book_id)
    if (i === -1) {return false}
    var i2 = vm.my_books[i].users.findIndex(function(o){
      return o.user_id === vm.user_id
    })
    if (i2 === -1) {return false}
    return vm.my_books[i].users[i2].trade !== undefined
  }

  methods.my_trade = function() {
    let vm = this
    return vm.my_books.filter(function(b){
      return vm.my_trade__is_tradeable(b.book.id)
    })
  }
}
