module.exports = function({data, methods}) {
  data.user_id = undefined
  data.user__got_login = false

  methods.user__get_login = function() {
    let vm = this
    req({url:'/user_id', json: true}).then(function(res){
      vm.user_id = res.user_id
      vm.user__got_login = true
    })
  }

  methods.user__init = function(){
    let vm = this
    vm.user__get_login()
  }
}
