// tools loading
require('./lib/jonoShortcuts.js')
w.wait = require('./lib/wait.js')
w.getJSON = require('./lib/getJSON.js')
w.postJSON = require('./lib/postJSON.js')
w.loadImg = require('./lib/loadImage.js')

// module loading
w.modules = {
  datas: require('./modules/$data.js'),
  header: require('./modules/header.js'),
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
