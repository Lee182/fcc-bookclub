module.exports = function ({methods, data, computed}) {
  w.map = undefined
  w.marker = undefined
  w.layer = undefined

  data.loci_ui = {
    search: false,
    input: ''
  }

  computed.me_account = function () {
    let vm = this
    if (!vm.is_user) { return false }
    var c1 = vm.router.path === '/user/:user_id'
    var c2 = vm.user._id === vm.router.params.user_id
    return !c1 || c2
  }
  data.account = undefined
  data.account_loaded = false
  data.account_books = []
  data.account_title = 'loading user...'

  methods.account__get = function () {
    let vm = this
    var c1 = vm.router.path === '/me'
    var c2 = vm.router.path === '/user/:user_id'
    var c3 = vm.is_user && vm.router.params.user_id === vm.user._id
    debugger
    if (c1 || c3) {
      vm.bookshelf__get(vm.user._id).then(res => {
        vm.bookshelf = res
        vm.account_books = vm.bookshelf
      })
      return vm.account__swap_user(vm.user)
    }
    var a = vm.router.params.user_id
    if (c2) {
      req({
        url: '/tradeshelf/' + a,
        json_res: true
      }).then(function (res) {
        console.log(res)
        if (vm.router.path === '/user/:user_id' && a === vm.router.params.user_id) {
          vm.account_books = res
        }
      })
      req({url: '/user/' + a, method: 'post', json_res: true}).then(function (user) {
        console.log('account', user)
        if (user.err === 'notfound') {
          console.log('here...')
          return vm.route__go('/', 'replaceState')
        }
        if (user && vm.router.params.user_id === a && vm.router.path === '/user/:user_id') {
          vm.account__swap_user(user)
        }
      })
    }
  }
  methods.account__clear = function () {
    let vm = this
    vm.account = undefined
    vm.account_loaded = false
    vm.account_title = 'loadding user...'
    vm.account_books = []
  }
  methods.account__swap_user = function (user) {
    let vm = this
    if (vm.is_user && vm.user._id === user._id) {
      vm.account_title = 'Me Account'
    } else {
      vm.account_title = '@' + user._id + ' Account'
    }
    vm.account = user
    vm.account_loaded = true
    debugger
    if (vm.account.loci) {
      vm.user_loci__map_refresh(true)
    }
  }

  methods.user_loci__map_render = function () {
    if (map && typeof map.remove === 'function') {
      map.remove()
    }
    let vm = this
    if (!vm.account) {
      return
    }
    var el = d.qs('.account-map')
    console.log(el)
    el.textContent = ''
    el.className = 'account-map'

    map = L.map(el)

    var icon = L.icon({
      iconUrl: 'http://' + w.location.host + '/pin.svg',
      iconSize: [58, 48],
      iconAnchor: [18, 42],
      popupAnchor: [0, -28]
    })

    layer = L.tileLayer('https://api.mapbox.com/styles/v1/lee182/cj002grxo00kq2spfvxdk64p6/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVlMTgyIiwiYSI6ImNqMDAyZmJ6MDAwNXkycXQwNDM2MTZhankifQ.tWdE2srazZzTryC4DPTQfw', {
      attribution: '',
      maxZoom: 15,
      minZoom: 3
    })
    layer.addTo(map)

    marker = L.marker(vm.account.loci.coords, {icon}).addTo(map)
    vm.user_loci__map_refresh()
  }

  methods.user_loci__map_refresh = function (redraw) {
    let vm = this
    if (typeof map !== 'object' || redraw === true) {
      return vm.user_loci__map_render()
    }
    map.setView([
      vm.account.loci.coords.lat,
      vm.account.loci.coords.lon
    ], 12)
    marker.setLatLng([
      vm.account.loci.coords.lat,
      vm.account.loci.coords.lon
    ]).update()
    marker.bindPopup(vm.account.loci.name)
    // .openPopup()
  }

  methods.map_search = function (place) {
    // http://wiki.openstreetmap.org/wiki/Nominatim
    let url = `http://nominatim.openstreetmap.org/search?
      format=jsonv2
      &q=${place}
      &addressdetails=1
    `.split('\n').map(function (str) {
      return str.trim()
    }).join('')
    return req({
      method: 'get',
      url,
      json: true
    })
  }

  methods.user_loci__ui_edit = function () {
    let vm = this
    vm.loci_ui.search = true
    vm.loci_ui.input = vm.account.loci.name
  }

  methods.user_loci__ui_clear = function () {
    let vm = this
    vm.loci_ui.input = ''
  }

  methods.user_loci__change_ui = function (e) {
    let vm = this
    return vm.user_loci__change(e.target.value)
  }

  methods.user_loci__change = function (place) {
    let vm = this
    vm.map_search(place).then(function (res) {
      if (res[0] === undefined) { return }
      vm.loci_ui.search = false
      vm.user.loci.name = res[0].display_name
      vm.user.loci.address = res[0].address
      vm.user.loci.coords.lat = Number(res[0].lat)
      vm.user.loci.coords.lon = Number(res[0].lon)

      vm.user_loci__map_refresh()
      return req({
        method: 'POST',
        url: '/user_loci__change',
        data: {loci: vm.user_loci, user_id: vm.user._id},
        json: true
      }).then(function (res) {
        vm.user = res
        console.log('user_loci__change', res)
      })
    })
  }
}

// vm.map_search({place: 'Hull, uk'})
