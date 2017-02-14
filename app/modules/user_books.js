module.exports = function({data, methods}) {
  data.user_books = []

  methods.user_books__getlist = function() {
    // some net then
    var book = {_id: 123, title: 'hello'}
    data.user_books.push({book: book})
  }
  methods.user_books__findId = function(book_id) {
    let vm = this
    return vm.user_books.findIndex(function(b){
      return b.book.id === book_id
    })
  }
  methods.user_books__add = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/user_books__add',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      console.log(res)
      if (res.err !== undefined) {return}
      vm.user_books.push(res)
    })
  }
  methods.user_books__remove = function(book_id) {
    let vm = this
    if (vm.user_id === undefined) {return}
    w.req({
      method: 'post',
      url: '/user_books__remove',
      data: {book_id, user_id: vm.user_id},
      cookies: true,
      json: true
    }).then(function(res){
      if (res.err !== undefined) {return}
      var i = vm.user_books__findId(book_id)
      if (i !== -1) {
        vm.user_books.splice(i, 1)
      }
    })

  }

  methods.user_books__is_in_array = function(book_id) {
    let vm = this
    return vm.user_books__findId(book_id) !== -1
  }
}
