module.exports = function({methods, data}) {

  data.nav = {
    items: [
      {text: 'about', active: true, onclick: 'method.loci'},
      {text: 'shop'},
      {text: 'why'}
    ],
    underline_style: {
      width: '0px',
      left: '0px'
    }
  }


  methods.nav_item_onclick = function(e, nav, i){
    let vm = this
    if (nav.items[i].active === true) {return}

    // change class by active prop
    nav.items.forEach(function(o){
      delete o.active
    })
    nav.items[i].active = true
    vm.$forceUpdate()

    vm.nav_move_underline(e.target.qsP('.nav'), nav, i)
  }

  methods.nav_move_underline = function(nav_el, nav, i) {
    var item = nav_el.children[1+i].getBoundingClientRect()
    var nav_box = nav_el.getBoundingClientRect()

    nav.underline_style.width = item.width + 'px'
    nav.underline_style.left = (item.left - nav_box.left + nav_el.scrollLeft)+'px'
  }
}
