module.exports = function({data, methods, computed}) {
  data.my_books = []
  data.my_books__filter_term = ''

  methods.my_books__findId = function(book_id) {
    let vm = this
    return vm.my_books.findIndex(function(b){
      return b.book.id === book_id
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

  methods.my_books__add = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/my_books__add',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.my_books__update(res)
    })
  }

  methods.my_books__remove = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/my_books__remove',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      if (res.err !== undefined) {return}
      var i = vm.my_books__findId(book_id)
      if (i !== -1) {
        vm.my_books.splice(i, 1)
      }
    })

  }

  methods.my_books__is_in_array = function(book_id) {
    let vm = this
    return vm.my_books__findId(book_id) !== -1
  }

  methods.bookshelf__view = function(books, search_term) {
    let vm = this
    var search_term = search_term.toLowerCase().trim()
    var search_reg = search_term.split('').join('.*')

    return books.map(function(b){
      return b.book
    }).filter(function(book){
      if (search_term.length === 0) {return true}

      const search_result = ['title', 'subtitle', 'authors'].reduce(function(bool, field){
        if (bool === true) {return true}
        if (book[field] === undefined) {return false}
        if (field === 'authors') {
          return book.authors.join(', ').toLowerCase().match(search_reg) !== null
        }
        return book[field].toLowerCase().match(search_reg) !== null
      }, false)

      return search_result
    })
  }

}
