module.exports = function({data, methods}) {
  data.head = {menu: {open: false}}
  data.head.show = undefined // '/'

  methods.head__elipsis_tog = function(menu){
    menu.open = !menu.open
  }
  methods.ellipsis_clickaway = function(e, menu){
    const clickOutSideMenu = e.target.matches('.ellipsis-fullscreen.show')
    if (clickOutSideMenu) {
      menu.open = false
    }
  }

}
