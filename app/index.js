// tools loading
require('./lib/jonoShortcuts.js')

w.Vue = require('vue/dist/vue.js')
// w.Vue = require('vue/dist/vue.min.js')
w.wait = require('./lib/wait.js')
w.req = require('./lib/request.js')
w.loadImg = require('./lib/loadImage.js')
// Vue.config.ignoredElements = [
//   'leaflet-map', 'another-web-component'
// ]

w.comms = require('./lib/comms.client.js')()
w.comms.on('close', function () {
  w.wait(500).then(function () {
    if (comms.ws.readyState === comms.ws.CLOSED) {
      comms.reconnect()
    }
  })
})

// module loading
w.modules = {
  market: require('./modules/market.js'),
  head: require('./modules/0-head.js'),
  router: require('./modules/0.1-router.js'),
  book_search: require('./modules/book_search.js'),
  bookshelf: require('./modules/bookshelf.js'),
  singe_book: require('./modules/book.js'),
  trade: require('./modules/trade.js'),
  user: require('./modules/user.js'),
  account: require('./modules/account.js'),
  notifcations: require('./modules/notifcations'),
  home: require('./modules/home.js')
}

w.vueobj = {
  el: '#app',
  data: {},
  computed: {},
  watch: {},
  methods: {},
  filters: {},

  // https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram
  beforeCreate: function () {},
  created: function () {
    let vm = this
    vm.request_notification_permission()
    vm.user__get().then(function () {
      vm.router__init()
      if (vm.is_user) {
        vm.bookshelf__get(vm.user._id).then(function (res) {
          console.log('booshelf', res)
          vm.bookshelf = res
        })
      }
      // load the front market view
    })
  },
  beforeMount: function () {},
  mounted: function () {
    let vm = this
  },
  beforeUpdate: function () {},
  updated: function () {},
  beforeDestroy: function () {},
  destroyed: function () {}
}

Object.keys(modules).forEach(function (name) {
  if (typeof modules[name] !== 'function') { return }
  modules[name](vueobj)
})

w.vm = new Vue(vueobj)
