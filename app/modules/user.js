module.exports = function({data, methods}) {
  data.user_id = undefined
  data.user__got_login = false

  methods.user__get_login = function() {
    let vm = this
    req({url:'/user_id', json: true}).then(function(res){
      vm.user_id = res.user_id
      vm.user__got_login = true
    }).catch(function(err){
      // TODO fix request error libary
      // console.log(err)
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
        vm.user_id = undefined
        vm.route__go('/', true)
      }
    })
  }

  methods.user__init = function(){
    let vm = this
    vm.user__get_login()
  }

  methods.user__settings_click = function(){
    let vm = this
    vm.header.menu.open = false
    vm.route__go('/my-account', true)
  }
  methods.user__logout_btn = function() {
    let vm = this
    vm.header.menu.open = false
    vm.user__logout()
  }
}
