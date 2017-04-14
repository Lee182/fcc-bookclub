module.exports = function({data, methods, computed}) {
  methods.is_unread = function(note){
    return note.read === false
  }

  computed.unread_count = function(){
    let vm = this
    if (!vm.is_user || vm.user.notifcations === undefined) {return 0}
    return vm.user.notifcations.filter(vm.is_unread).length
  }
  computed.notifcations = function(){
    let vm = this
    if (!vm.is_user) {return []}
    return vm.user.notifcations.reverse()
  }

  function lz(n) { // leading zero
    if (n < 10) {return '0'+n}
    return n.toString()
  }
  methods.fulltime = function(d) {
    d = new Date(d)
    return d.getFullYear()+'-'+lz(d.getMonth()+1)+'-'+lz(d.getDate())+' '+lz(d.getHours())+':'+lz(d.getMinutes())
  }
  methods.note__mark__read = function(note){
    let vm = this
    if (note.read === true) {return}
    req({
      url: 'note__mark__read',
      method: 'post',
      data: {user_id: vm.user._id, note},
      json: true,
      cookies: true
    })
  }
  methods.note__mark__opened = function(note){
    // some net request
    let vm = this
    vm.route__go(note.path, 'pushState')
    if (note.opened === true){return}
    req({
      url: 'note__mark__opened',
      method: 'post',
      data: {user_id: vm.user._id, note},
      json: true,
      cookies: true
    })
  }
  w.comms.on('message', function(o){
    if (vm) {
      var old_count = vm.unread_count
      if(o.user && o.note){
        vm.user = o.user
        var new_count = vm.unread_count
        if (new_count > old_count) {
          console.log(new_count, old_count)
          vm.notify({
            title: '#booktrade',
            message: vm.notifcations[0].message,
          })
        }
      }
    }

  })


  methods.notify = function({title, message}){
    let vm = this
    return new Notification(title, {
      body: message,
      lang: 'en',
      icon: location.protocol+'//'+location.host+'/favicon.png'})
  }
  methods.request_notification_permission = function(){
    let vm = this
    Notification.requestPermission(function(e){
      console.log('notify callback', e)
    })
  }

}
