// tools loading
require('./lib/jonoShortcuts.js')
w.wait = require('./lib/wait.js')
w.req = require('./lib/request.js')
w.loadImg = require('./lib/loadImage.js')
w.querystring = require('querystring')

// module loading
w.modules = {
  header: require('./modules/header.js'),
  android_tabs: require('./modules/android_tabs.js'),
  book_search: require('./modules/book_search.js'),
  bookshelf: require('./modules/bookshelf.js'),
  trade: require('./modules/trade.js'),
  router: require('./modules/router.js')
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
    var qs = querystring.parse(new URL(location.href).search.substr(1))
    if (qs.user_id) {
      vm.user_id = qs.user_id
    }

    vm.router__init()
    vm.bookshelf__get()
    req({url:'/user_id', json: true}).then(function(res){
      console.log(res)
      //
      // if (res.user_id) {
      //   vm.user_id = res.user_id
      // }
    })
  },
  beforeMount: function(){},
  mounted: function(){},
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
