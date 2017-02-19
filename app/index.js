// tools loading
require('./lib/jonoShortcuts.js')
w.wait = require('./lib/wait.js')
w.req = require('./lib/request.js')
w.loadImg = require('./lib/loadImage.js')

// module loading
w.modules = {
  header: require('./modules/header.js'),
  add_book: require('./modules/add_book.js'),
  bookshelf: require('./modules/bookshelf.js'),
  my_trade: require('./modules/trade.js'),
  my_trade_reqs: require('./modules/my_trade_reqs.js')
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
    req({
      url: '/bookshelf/'+vm.user_id,
      cookies: true,
      json: true
    }).then(function(res){
      vm.bookshelf = res
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
