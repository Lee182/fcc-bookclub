module.exports = function({data, methods}){
  data.router = {}
  data.router.path = '/'
  data.router.paths = [
    { path: '/' },
    { path: '/my-account', loginRequired: true},
    { path: '/my-bookshelf', loginRequired: true},
    { path: '/my-bookshelf/add', loginRequired: true},
  ]
  methods.router__init = function(){
    let vm = this
    w.on('popstate', vm.route__listener)
    vm.route__go(location.pathname, false, true)
  }

  methods.router_direct_path = function(pathname) {
    let vm = this
    let path = vm.router.paths.find(function(item){
      return pathname === item.path
    })
    if (path === undefined) {
      // redirect to /
      path = vm.router.paths[0]
    }
    if (path.loginRequired === true) {
      return vm.user_id__get().then(function(user_id){
        if (user_id === undefined) {
          return vm.router.paths[0]
        }
        return path
      })
    }
    return Promise.resolve(path)
  }

  methods.route__set_path = function(path){
    let vm = this
    if (path === '/my-account'){
      wait(1000).then(function(){
        vm.user_loci__map_refresh(true)
      })
    }
    vm.header.show = path
    vm.router.path = path
  }

  methods.route__go = function(path, addToHistory, replaceState) {
    let vm = this
    console.log('route__go req:', path, addToHistory, replaceState)
    return vm.router_direct_path(path).then(function(item){
      console.log('route__go', item.path, addToHistory, replaceState)
      if (item.path === vm.router.path) {
        console.log('same path')
        return vm.route__set_path(item.path)
      }
      vm.route__set_path(item.path)
      if (replaceState === true){
        return history.replaceState({path}, '#booktrade', path)
      }
      if (addToHistory === true) {
        return history.pushState({path}, '#booktrade', path)
      }
    })
  }

  methods.route__back = function() {
    var a = history.state.path
    history.go(-1)
    wait(400).then(function(){
      var b = history.state.path
      if (a === b) {
        console.log('last path')
        vm.route__go('/', true, false)
      }
    })
  }

  methods.route__listener = function(popstate){
    if (popstate.state === null) {return}
    console.log('route_listener', history.state)
    this.route__go(popstate.state.path)
  }

}
