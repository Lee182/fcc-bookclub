module.exports = function({data, methods}){
  data.router = {}
  data.router.history = []

  methods.route = function(path) {
    let vm = this
    const headerHasPath = vm.header.paths.findIndex(function(item){
      return path === item
    }) !== -1
    if (headerHasPath) {
      vm.header.show = path
    }
    vm.router.path = path
    vm.router.history.push(path)
    console.log('router.path', path)
    history.replaceState({}, '#booktrade', path)
  }

}
