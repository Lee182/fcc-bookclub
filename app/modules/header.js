module.exports = function({data, methods}) {
  data.user_id = undefined
  data.ip = undefined

  data.header = {}
  data.header.widths = {}
  var width = data.header.widths
  data.header.navInFirstRow = false

  methods.header_getWidths = function() {
    var head = d.qs('.header')
    var navitems = head.qsa('.nav.show > .nav-item').toArray()
    var topline = head.qsa('.header-title, .header-icon').toArray()

    function sumWidths(n, el){
      var a = el.getBoundingClientRect()
      return a.width + n
    }
    let vm = this
    width.screen = d.children[0].clientWidth
    width.nav = navitems.reduce(sumWidths, 0)
    width.topline = topline.reduce(sumWidths, 0)
  }
  methods.header_placeNav = function() {
    let vm = this
    vm.header_getWidths()
    vm.header.navInFirstRow = (width.screen - width.topline) > width.nav
  }


  data.header.menu = {
    items: [
      {text: 'refresh'},
      {text: 'settings'},
      {text: 'logout'}
    ],
    open: false
  }
  methods.header__elipsis_tog = function(menu){
    menu.open = !menu.open
  }
  methods.ellipsis_clickaway = function(e, menu){
    const clickOutSideMenu = e.target.matches('.ellipsis-fullscreen.show')
    if (clickOutSideMenu === true) {
      menu.open = false
    }
  }

  methods.login = function(){
    let vm = this
    if (vm.user_id !== undefined) {return}
    location.href = '/twitter'
  }
  methods.logout = function(){
    let vm = this
    vm.user_id = undefined
  }

  methods.header__oncreate = function(){
    let vm = this
    vm.header_placeNav()
    w.on('resize', function(){
      vm.header_placeNav()
    })
  }
  data.user_id = 'realDonaldTrump'
}
