// tools loading
require('./lib/jonoShortcuts.js')
w.wait = require('./lib/wait.js')
w.req = require('./lib/request.js')
w.loadImg = require('./lib/loadImage.js')

Vue.config.ignoredElements = [
  'leaflet-map', 'another-web-component'
]

// module loading
w.modules = {
  header: require('./modules/header.js'),
  android_tabs: require('./modules/android_tabs.js'),
  book_search: require('./modules/book_search.js'),
  bookshelf: require('./modules/bookshelf.js'),
  trade: require('./modules/trade.js'),
  user: require('./modules/user.js'),
  router: require('./modules/router.js'),
  account: require('./modules/account.js')
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
    vm.router__init()
    vm.user__init().then(function(){
      vm.bookshelf__get(vm.user_id)
    })

  },
  beforeMount: function(){},
  mounted: function(){
    let vm = this
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
