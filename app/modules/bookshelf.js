module.exports = function({data, methods, computed}) {
  data.bookshelf = []
  data.bookshelf__filter_term = ''

  methods.bookshelf__findId = function(book_id) {
    let vm = this
    return vm.bookshelf.findIndex(function(b){
      return b.book.id === book_id
    })
  }

  methods.bookshelf__update = function(b){
    var i = vm.bookshelf__findId(b.book.id)
    if (i === -1) {
      vm.bookshelf.push(b)
    }
    if (i !== -1) {
      Vue.set(vm.bookshelf, i, b)
    }
  }

  methods.bookshelf__add = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/bookshelf__add',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      vm.bookshelf__update(res)
    })
  }

  methods.bookshelf__remove = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/bookshelf__remove',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      if (res.err !== undefined) {return}
      var i = vm.bookshelf__findId(book_id)
      if (i !== -1) {
        vm.bookshelf.splice(i, 1)
      }
    })

  }

  methods.bookshelf__is_in_array = function(book_id) {
    let vm = this
    return vm.bookshelf__findId(book_id) !== -1
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
