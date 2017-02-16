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
      if (res.err !== undefined) {return}
      console.log('/my_trade__add', res)
      vm.my_books__update(res.value)
    })
  }

  methods.my_trade__remove = function(book_id) {
    console.log('hellolol')
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/my_trade__remove',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      console.log('/mytrade_remove', res)
      if (res.err !== undefined) {return}
      vm.my_books__update(res.value)
    })
  }

  methods.my_books__update = function(b){
    var i = vm.my_books__findId(b.book.id)
    if (i === -1) {
      vm.my_books.push(b)
    }
    if (i !== -1) {
      Vue.set(vm.my_books, i, b)
    }
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

  methods.my_trade__view = function() {
    let vm = this
    var term = vm.my_trade__filter_term.trim()
    var reg = term.split('').join('.*')

    return vm.my_trade().map(function(b){
      return b.book
    }).filter(function(book){
      if (term === '') {return true}
      return ['title', 'subtitle', 'authors'].reduce(function(bool, field){
        if (bool === true) {return true}
        if (book[field] === undefined) {return false}
        if (field === 'authors') {
          return book.authors.join(', ').toLowerCase().match(reg) !== null
        }
        return book[field].toLowerCase().match(reg) !== null
      }, false)
    })
  }
}
