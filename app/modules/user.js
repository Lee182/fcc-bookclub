module.exports = function({data, methods, computed}) {
  data.user = undefined
  data.user__got_login = false

  computed.is_user = function() {
    let vm = this
    return vm.user !== undefined && vm.user !== null && typeof vm.user._id === 'string'
  }

  methods.user__get = function() {
    let vm = this
    return req({url:'/user', json: true}).then(function(res){
      console.log("user", res)
      vm.user = res
      vm.user_loci__map_refresh(true)
      vm.user__got_login = true
    }).catch(function(err){
      vm.user__got_login = true
    })
  }

  methods.user__logout = function() {
    let vm = this
    return req({
      method: 'post',
      url: '/tw.logout',
      json: true
    }).then(function(res){
      if (res.logout === true) {
        vm.route__go('/', 'pushState').then(function(){
          vm.user = undefined
          vm.bookshelf = []
        })
      }
    })
  }


  methods.user__btn__settings = function(){
    let vm = this
    vm.head.menu.open = false
    vm.route__go('/me', 'pushState')
  }
  methods.user__btn__logout = function() {
    let vm = this
    vm.head.menu.open = false
    vm.user__logout()
  }
}
