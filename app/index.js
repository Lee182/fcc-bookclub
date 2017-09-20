// tools loading
require('/app/lib/jonoShortcuts.js')
w.wait = require('/app/lib/wait.js')
w.req = require('/app/lib/request.js')
w.loadImg = require('/app/lib/loadImage.js')

Vue.config.ignoredElements = [
  'leaflet-map', 'another-web-component'
]

w.comms = require('/app/lib/comms.client.js')()
w.comms.on('close', function(){
  w.wait(500).then(function(){
    if (comms.ws.readyState === comms.ws.CLOSED) {
      comms.reconnect()
    }
  })
})

// module loading
w.modules = {
  head: require('/app/modules/0-head.js'),
  router: require('/app/modules/0.1-router.js'),
  book_search: require('/app/modules/book_search.js'),
  bookshelf: require('/app/modules/bookshelf.js'),
  singe_book: require('/app/modules/book.js'),
  trade: require('/app/modules/trade.js'),
  user: require('/app/modules/user.js'),
  account: require('/app/modules/account.js'),
  market: require('/app/modules/market.js'),
  notifcations: require('/app/modules/notifcations'),
  home: require('/app/modules/home.js')
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
    vm.request_notification_permission()
    vm.user__get().then(function(){
      vm.router__init()
      if (vm.is_user){
        vm.bookshelf__get(vm.user._id).then(function(res){
          console.log('booshelf', res)
          vm.bookshelf = res
        })
      }
      // load the front market view

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
