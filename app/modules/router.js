module.exports = function({data, methods}){
  data.router = {}
  data.router.path
  history.replaceState({path: location.pathname}, '#booktrade', location.pathname)

  methods.route__init_listener = function(){
    let vm = this
    w.on('popstate', vm.route__listener)
  }

  methods.route__set_path = function(path){
    let vm = this
    const headerHasPath = vm.header.paths.findIndex(function(item){
      return path === item
    }) !== -1
    if (headerHasPath) {
      vm.header.show = path
    }
    vm.router.path = path
  }

  methods.route__path = function(path) {
    let vm = this
    vm.route__set_path(path)
    history.pushState({path}, '#booktrade', path)
  }

  methods.route__goto = function(path) {
    // no history
    let vm = this
    vm.route__set_path(path)
  }

  methods.route__listener = function(popstate){
    console.log('route_listener', popstate.state)
    if (popstate === null) {return}
    this.route__goto(popstate.state.path)
  }

}
