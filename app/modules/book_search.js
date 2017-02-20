module.exports = function({data, methods, computed}) {
  data.bs1 = {} // book search 1
  data.bs1.req = {
    query: '',
    pagenum: 1
  }
  data.bs1.res = {
    query: '',
    pagenum: 1,
    pages: 10,
    books: [],
    show: false
  }
  data.bs1.req_atm = false

  methods.book_search = function(bs1) {
    let vm = this
    if (bs1.req.query.trim() === '') {
      bs1.res = false
      bs1.books = []
      return
    }
    bs1.req_atm = bs1.req
    var promise = w.req({
      method: 'get',
      url: '/book_search/'+bs1.req.query + '/'+bs1.req.pagenum,
      timeout: 10000,
      json: true
    }).then(function(res){
      bs1.req_atm = false
      bs1.res = res
      bs1.res.show = true
    })
    return promise
  }

  methods.book_search__change_page = function(bs1, pagenum) {
    // changes the page number then searches
    bs1.req.pagenum = pagenum
    let vm = this
    vm.book_search(bs1)
  }

  methods.pagination = function (active_page, pages_showing, last_pg) {
    var mod = active_page % pages_showing
    if (mod === 0) {mod = pages_showing}
    mod = -mod
    var arr = []
    for (var i = 0; i < (pages_showing+2); i++) {
      let o = {n: active_page+mod}
      if (o.n < last_pg && o.n >= 1) {
        arr.push( o )
      }
      mod++
    }
    return arr.map(function(o, i){
      if (i === 0 && o.n > 1) {
        o.start = true
      }
      if (o.n === active_page) {
        o.active = true
      }
      if (i+1 === arr.length && o.n < last_pg) {
        o.end = true
      }
      return o
    })

    // returns an object like this
    // pagination(5, 3, 20)
    // [
    //   {n:3, start: true},
    //   {n:4},
    //   {n:5, active: true},
    //   {n:6},
    //   {n:7}, end: true
    // ]
  }

}
