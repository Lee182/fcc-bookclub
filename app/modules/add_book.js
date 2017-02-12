module.exports = function({data, methods, computed}) {
  data.add_book__search_input = ''
  data.add_book__search_input_pagenum = 1

  data.add_book__search_result = ''
  data.add_book__search_result_pages = 10
  data.add_book__search_result_pagenum = 0
  data.add_book__books = []

  methods.add_book__search = function(e) {
    let vm = this
    if (e && e.keyCode === 13) {
      vm.add_book__search_input_pagenum = 1
    }
    w.getJSON({
      url: '/book_search/'+vm.add_book__search_input + '/'+vm.add_book__search_input_pagenum,
      ms: 10000
    }).then(function(res){
      console.log(res)
      if (res.books !== undefined) {
        vm.add_book__books = res.books
        vm.add_book__search_result = res.searched
        vm.add_book__search_result_pagenum = res.pagenum
        vm.add_book__search_result_pages = res.pages
      }
    })
  }

  methods.add_book__change_page = function(pg) {
    console.log(pg)
    let vm = this
    if (pg > vm.add_book__search_result_pages) {
      pg = vm.add_book__search_result_pages
    }
    if (pg <= 0) {pg = 1}
    vm.add_book__search_input_pagenum = pg
    vm.add_book__search_result_pagenum = pg
    data.add_book__books = []
    vm.add_book__search()
  }

  methods.pagination = function(pg) {
    if (pg % 3 === 1) {
      return [pg-1,    pg, pg+1, pg+2,    pg+3]
    }
    if (pg % 3 === 2) {
      return [pg-2,    pg-1, pg, pg+1,    pg+2]
    }
    if (pg % 3 === 0) {
      return [pg-3,    pg-2, pg-1, pg,    pg+1]
    }
  }



}
