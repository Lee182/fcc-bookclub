w.books =  require('../../example_json/book.js')

module.exports = function({methods, data, watch}) {
  // sb stands for single_book
  data.sb = {}
  data.sb_loaded = false
  data.sb_title = 'loading book...'

  methods.sb__load = function(book_id) {
    let vm = this
    let book = vm.sb__load_a(book_id) || vm.sb__load_b(book_id)
    if (book !== undefined) {
      return Promise.resolve(book)
    }
    return vm.sb__load_c(book_id)
  }

  methods.sb__load_a = function(book_id) {
    // check my bookshelf
    var i = vm.bookshelf__findId('UuMRFJqmJ_sC')
    if (i !== -1) {
      return vm.bookshelf[0]
    }
    return undefined
  }
  methods.sb__load_b = function(book_id) {
    // check search results
    let vm = this
    var book = vm.bs1.res.books.find(function(b){
      return b.id === book_id
    })
    if (book){
      return vm.format_book(book)
    }
  }
  methods.sb__load_c = function(book_id) {
    // if not found make server request
    let vm = this
    return req({
      method: 'get',
      url: '/book_id/'+book_id,
      json: true
    }).then(function(res){
      return vm.format_book(res)
    })
  }

  methods.sb__init = function(book_id){
    let vm = this
    vm.sb__load(book_id).then(function(book){
      vm.sb = book
      vm.sb_loaded = true
      vm.sb_title = 'Book: "'+ vm.sb.book.title + '"'
    })
  }
  methods.sb__clear = function(){
    let vm = this
    vm.sb_loaded = false
    vm.sb_title = 'loading book...'
  }

  methods.sb__enter = function() {
    console.log('here', this)
    let vm = this
    vm.sb__init(vm.router.params.book_id)
  }
  methods.sb__leave = function(){
    let vm = this
    vm.sb__clear()
  }
}
