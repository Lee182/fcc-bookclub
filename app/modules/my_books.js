module.exports = function({data, methods, computed}) {
  data.my_books = []
  data.my_books__filter_term = ''

  methods.my_books__getlist = function() {
    // some net then
    var book = {_id: 123, title: 'hello'}
    data.my_books.push({book: book})
  }
  methods.my_books__findId = function(book_id) {
    let vm = this
    return vm.my_books.findIndex(function(b){
      return b.book.id === book_id
    })
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
      console.log(res)
      if (res.err !== undefined) {return}
      vm.my_books.push(res)
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

  computed.my_books__view = function() {
    let vm = this
    var term = vm.my_books__filter_term.trim()
    var reg = term.split('').join('.*')

    return vm.my_books.map(function(b){
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
