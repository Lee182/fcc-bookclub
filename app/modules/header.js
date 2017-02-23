module.exports = function({data, methods}) {
  data.user_id = undefined
  data.ip = undefined

  data.header = {}
  data.header.widths = {}
  var width = data.header.widths
  data.header.navInFirstRow = false
  data.header.nav = [
    {text: 'about'},
    {text: 'search'},
    {text: 'bookshelf'},
    {text: 'trades'}
  ]
  data.header.nav_active = {
    width: 0,
    left: 0
  }
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


  methods.header__navclick = function(i){
    let vm = this
    if (vm.header.nav[i].active === true) {return}

    // change the active item
    vm.header.nav.forEach(function(o){
      delete o.active
    })
    vm.header.nav[i].active = true
    vm.$forceUpdate()

    vm.header__nav_moveunderline(i)
    // change the stage content
  }
  methods.header__nav_moveunderline = function(i) {
    let vm = this
    var nav = d.qs('.nav.show')
    var navb = nav.getBoundingClientRect()
    var els = d.qsa('.nav.show > .nav-item').toArray()
    var item = els[i].getBoundingClientRect()
    vm.header.nav_active.width = item.width + 'px'
    vm.header.nav_active.left = (item.left - navb.left + nav.scrollLeft) + 'px'
  }

  data.header.menu = [
    {text: 'refresh'},
    {text: 'settings'},
    {text: 'logout'},
  ]
  data.header.menu_open = false
  methods.header__elipsis_tog = function(){
    let vm = this
    vm.header.menu_open = !vm.header.menu_open
  }
  methods.ellipsis_clickaway = function(e){
    let vm = this
    const clickOutSideMenu = e.target.matches('.ellipsis-fullscreen.show')
    if (clickOutSideMenu === true) {
      vm.header.menu_open = false
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
    vm.header__navclick(0)
    w.on('resize', function(){
      vm.header_placeNav()
    })
  }
  data.user_id = 'realDonaldTrump'
}
