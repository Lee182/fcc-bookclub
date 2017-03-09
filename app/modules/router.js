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
    if (vm.user_id === undefined && path.loginRequired === true){
      // redirect to /
      path = vm.router.paths[0]
    }
    return path
  }

  methods.route__set_path = function(path){
    let vm = this
    vm.header.show = path
    vm.router.path = path
  }

  methods.route__go = function(path, addToHistory) {
    let vm = this
    path = vm.router_direct_path(path).path
    console.log('route__go', path)
    vm.route__set_path(path)
    if (addToHistory === true) {
      history.pushState({path}, '#booktrade', path)
    }
  }

  methods.route__listener = function(popstate){
    console.log('route_listener', popstate.state)
    if (popstate === null) {return}
    this.route__go(popstate.state.path)
  }

}
