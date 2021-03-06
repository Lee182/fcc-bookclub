module.exports = function ({data, methods, computed}) {
  data.bookshelf = []
  data.bookshelf__search_term = ''

  methods.bookshelf__get = function (user_id) {
    let vm = this
    return req({
      url: '/bookshelf/' + user_id,
      cookies: true,
      json: true
    })
  }

  methods.bookshelf__findId = function (book_id) {
    let vm = this
    return vm.bookshelf.findIndex(function (b) {
      return b.book.id === book_id
    })
  }

  methods.bookshelf__add = function (book_id) {
    let vm = this
    if (!vm.is_user) { return }
    w.req({
      method: 'post',
      url: '/bookshelf__add',
      data: {book_id, user_id: vm.user._id},
      cookies: true,
      json: true
    }).then(function (res) {
      vm.bookshelf__update(res)
    })
  }

  methods.bookshelf__remove = function (book_id) {
    let vm = this
    if (!vm.is_user) { return }
    w.req({
      method: 'post',
      url: '/bookshelf__remove',
      data: {book_id, user_id: vm.user._id},
      cookies: true,
      json: true
    }).then(function (res) {
      if (res.err !== undefined) { return }
      var i = vm.bookshelf__findId(book_id)
      if (i !== -1) {
        vm.bookshelf.splice(i, 1)
      }
    })
  }

  methods.bookshelf__update = function (b) {
    if (b === undefined) { return }
    let vm = this
    var i = vm.bookshelf__findId(b.book.id)
    if (i === -1) {
      vm.bookshelf.unshift(b)
    }
    if (i !== -1) {
      Vue.set(vm.bookshelf, i, b)
    }
  }

  methods.bookshelf__is_in_array = function (book_id) {
    let vm = this
    return vm.bookshelf__findId(book_id) !== -1
  }

  methods.bookshelf__view = function (books, search_term) {
    let vm = this
    var search_term = search_term.toLowerCase().trim()
    var search_reg = search_term
    // var search_reg = search_term.split('').join('.*')

    return books.filter(function (b) {
      var book = b.book
      if (search_term.length === 0) { return true }

      const search_result = ['title', 'subtitle', 'authors'].reduce(function (bool, field) {
        if (bool === true) { return true }
        if (book[field] === undefined) { return false }
        if (field === 'authors') {
          return book.authors.join(', ').toLowerCase().match(search_reg) !== null
        }
        return book[field].toLowerCase().match(search_reg) !== null
      }, false)

      return search_result
    })
  }

  methods.bookshelf_authors = function (book) {
    if (book.book.authors === undefined) { return '' }
    return book.book.authors.join(', ')
  }
}
