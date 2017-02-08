module.exports = function({data, methods}) {
  data.user_id = undefined
  data.ip = undefined
  data.header_count = 0
  function currentWidth() {
    return document.body.parentNode.clientWidth
  }
  function init_header(e){
    if (currentWidth() > 600) {
      data.header_open = true
      return true
    }
    data.header_open = false
    return false
  }
  init_header()

  methods.login =  function(){
    let vm = this
    if (vm.user_id !== undefined) {return}
    location.href = '/twitter'
  }
  methods.logout = function(){
    let vm = this
    vm.user_id = undefined
  }

  methods.header_tog = function(a){
    console.log(a)
    let vm = this
    if (currentWidth() > 600 && vm.header_open === true) {
      return
    }
    vm.header_open = !vm.header_open
  }

  w.on('resize', init_header)

  data.user_id = 'realDonaldTrump'
  data.header_count = 5
}
