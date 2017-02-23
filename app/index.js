// tools loading
require('./lib/jonoShortcuts.js')
w.wait = require('./lib/wait.js')
w.req = require('./lib/request.js')
w.loadImg = require('./lib/loadImage.js')

// module loading
w.modules = {
  header: require('./modules/header.js'),
  book_search: require('./modules/book_search.js'),
  bookshelf: require('./modules/bookshelf.js'),
  trade: require('./modules/trade.js')
}

vueobj = {
  el: '#app',
  data: {},
  computed: {},
  watch: {},
  methods: {},
  filters: {},

  // https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram
  beforeCreate: function(){},
  created: function(){
    let vm = this
    vm.bookshelf__get()
  },
  beforeMount: function(){},
  mounted: function(){
    let vm = this
    vm.header__oncreate()
  },
  beforeUpdate: function(){},
  updated: function(){},
  beforeDestroy: function(){},
  destroyed: function(){}
}

Object.keys(modules).forEach(function(name){
  if (typeof modules[name] !== 'function') {return}
  modules[name](vueobj)
})

w.vm = new Vue(vueobj)
