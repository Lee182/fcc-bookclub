module.exports = function({data, methods}){
  data.router = {}
  data.router.path = location.pathname
  data.router.paths = [
    { path: '/' },
    { path: '/my-bookshelf', loginRequired: true},
    { path: '/my-account', loginRequired: true}
  ]

  methods.router__init = function(){
    let vm = this
    w.on('popstate', vm.route__listener)
    history.replaceState({path: location.pathname}, '#booktrade', location.pathname)
    vm.route__go(location.pathname)
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

  methods.route__go = function(path, addToHistory) {
    let vm = this
    vm.router_direct_path(path).then(function(item){
      console.log('route__go', item.path, addToHistory)
      vm.route__set_path(item.path)
      if (addToHistory === true) {
        history.pushState({path}, '#booktrade', path)
      }
    })
  }

  methods.route__back = function() {
    history.go(-1)
  }

  methods.route__listener = function(popstate){
    console.log('route_listener', popstate.state)
    if (popstate === null) {return}
    this.route__go(popstate.state.path)
  }

}
