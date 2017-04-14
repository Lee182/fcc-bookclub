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
    let book = vm.sb__load_a(book_id) || vm.sb__load_b(book_id)
    if (book !== undefined) {
      return vm.sb__set(book)
    }
    vm.sb__load_c(book_id).then(function(book){
      if (vm.router.path === '/book/:book_id'
      && vm.router.params.book_id === book._id) {
        vm.sb__set(book)
      }
    })

  }
  methods.sb__leave = function(){
    let vm = this
    vm.sb__clear()
  }




  methods.iso_date = function(d){
    d = new Date(d)
    return d.toISOString().substr(0,10)
  }
  methods.is_trader = function(user) {
    // user within book.users
    return user.trade !== undefined
  }
  methods.traders = function(users){
    let vm = this
    return users.filter(vm.is_trader)
  }
  methods.owner__trade_status = function(owner) {
    let vm = this
    if (!vm.is_user) {return 'NOT_SENT'}
    if (owner.user_id === vm.user._id) {
      return 'ME'
    }
    var request = owner.trade.requests.find(function(a){
      return a.user_id === vm.user._id
    })
    return vm.req__trade_status(request)
  }

  methods.req__trade_status = function(request){
    if (request === undefined){
      return 'NOT_SENT' // req not sent
    }
    if (request.accept === undefined && request.decline === undefined) {
      return 'AWAITING'
    }
    if (request.accept === true) {
      return 'ACCEPTED'
    }
    if (request.decline === true){
      return 'DECLINED'
    }
  }


  methods.owner_class = function(owner) {
    let vm = this
    var o = {}
    var a = vm.owner__trade_status(owner).toLowerCase()
    o[a] = true
    return o
  }
}
