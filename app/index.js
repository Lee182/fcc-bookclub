// tools loading
require('./lib/jonoShortcuts.js')
w.wait = require('./lib/wait.js')
w.req = require('./lib/request.js')
w.loadImg = require('./lib/loadImage.js')

// module loading
w.modules = {
  datas: require('./modules/$data.js'),
  header: require('./modules/header.js'),
  user_books: require('./modules/user_books.js'),
  add_book: require('./modules/add_book.js')
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
      url: '/user_books/'+vm.user_id,
      cookies: true,
      json: true
    }).then(function(res){
      vm.user_books = res
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
  modules[name](vueobj)
})

w.vm = new Vue(vueobj)
