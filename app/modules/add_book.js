module.exports = function({data, methods, computed}) {
  data.add_book = {}
  var d = data.add_book
  methods.add_book = {}
  d.search_req = {
    query: '',
    pagenum: 1
  }
  d.search_res = {
    query: '',
    pagenum: 1,
    pages: 10,
    books: [],
    show: false
  }

  methods.add_book__search_books = function(search_req) {
    console.log('search_req', search_req)
    let vm = this
    w.req({
      method: 'get',
      url: '/book_search/'+search_req.query + '/'+search_req.pagenum,
      timeout: 10000,
      json: true
    }).then(function(res){
      console.log(res)
      d.search_res = res
      d.search_res.show = true
    })
  }

  methods.add_book__change_page = function(pagenum) {
    console.log('change_page', pagenum)
    let vm = this
    vm.add_book__search_books({
      query: d.search_req.query,
      pagenum
    })
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
