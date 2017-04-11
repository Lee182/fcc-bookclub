w.books =  require('../../example_json/book.js')

module.exports = function({methods, data, watch}) {
  // sb stands for single_book
  data.sb = {}
  data.sb_loaded = false
  data.sb_title = 'loading book...'

  methods.sb__load_a = function(book_id) {
    // check my bookshelf
    var i = vm.bookshelf__findId(book_id)
    if (i !== -1) {
      return vm.bookshelf[i]
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


  methods.sb__set = function(book) {
    let vm = this
    vm.sb = book
    vm.sb_loaded = true
    vm.sb_title = 'Book: "'+ vm.sb.book.title + '"'
  }

  methods.sb__clear = function(){
    let vm = this
    vm.sb_loaded = false
    vm.sb_title = 'loading book...'
    vm.sb_owner_loaded = false
    vm.sb_owners = []
  }

  methods.sb__enter = function() {
    let vm = this
    var book_id = vm.router.params.book_id
    vm.sb_owners__init(book_id)
    let book = vm.sb__load_a(book_id) || vm.sb__load_b(book_id)
    if (book !== undefined) {
      return vm.sb__set(book)
    }
    vm.sb__load_c(book_id).then(function(book){
      if (vm.router.path === '/books/:book_id'
      && vm.router.params.book_id === book._id) {
        vm.sb__set(book)
      }
    })

  }
  methods.sb__leave = function(){
    let vm = this
    vm.sb__clear()
  }



  data.sb_owner_loaded = false
  data.sb_owners = []
  methods.sb_owners__init = function(book_id) {
    let vm = this
    return req({
      url: '/bookowners/'+book_id,
      json: true
    }).then(function(res){
      console.log(res)
      if (vm.router.path === '/books/:book_id'
      && vm.router.params.book_id === book_id) {

        vm.sb_owners = res
        vm.sb_owner_loaded = true
      }
    })
  }
  methods.iso_date = function(d){
    d = new Date(d)
    return d.toISOString().substr(0,10)
  }
  methods.owner_loci = function() {

  }

  methods.owner__trade_status = function(owner) {
    console.log('owner', owner)
    let vm = this
    var request = owner.trade.requests.find(function(a){
      return a.user_id === vm.user_id
    })
    if (request === undefined){
      return '' // req not sent
    }
    if (request.accepted === undefined && request.declined === undefined) {
      return 'AWAITING'
    }
    if (request.accepted === true) {
      return 'ACCEPTED'
    }
    if (request.declined === true){
      return 'DECLINED'
    }
  }
  methods.owner_class = function(owner) {
    let vm = this
    var o = {}
    var a = vm.owner__trade_status(owner).toLowerCase()
    if (a === ''){
      a = 'plain'
    }
    o['tr-'+a] = true
    return o
  }
}
