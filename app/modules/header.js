module.exports = function({data, methods}) {

  data.header = {menu: {open: false}}
  data.header.paths = ['/', '/my-bookshelf']
  data.header.show = '/'

  methods.header__elipsis_tog = function(menu){
    menu.open = !menu.open
  }
  methods.ellipsis_clickaway = function(e, menu){
    const clickOutSideMenu = e.target.matches('.ellipsis-fullscreen.show')
    if (clickOutSideMenu) {
      menu.open = false
    }
  }


  data.user_id = undefined
  data.user_id = 'realDonaldTrump'
}
