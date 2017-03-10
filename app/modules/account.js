module.exports = function({methods, data}){
  w.map = undefined
  w.marker = undefined
  w.layer = undefined

  data.user_loci = {
    name: 'Mansfield, GB',
    coords: {
      lat: 53.135051,
      lon: -1.2159578
    },
    address: {
      road: "Washington Drive",
      suburb: "Mansfield Woodhouse",
      town: "Nottinghamshire",
      state_district: "East Midlands",
      state: "England",
      country: "United Kingdom",
      country_code: "gb"
    }
  }
  data.user_loci.ui = {
    search: false,
    input: data.user_loci.name
  }

  methods.user_loci__map_render = function() {
    if (map && typeof map.remove === 'function') {
      map.remove()
    }
    let vm = this
    var el = d.qs('.account-map')
    el.textContent = ''
    el.className = 'account-map'

    map = L.map(el)

    var icon = L.icon({
      iconUrl: 'http://localhost:3000/pin.svg',
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

    marker = L.marker(vm.user_loci.coords, {icon}).addTo(map)
    vm.user_loci__map_refresh()
  }

  methods.user_loci__map_refresh = function(redraw) {
    let vm = this
    if (typeof map !== 'object' || redraw === true){
      return vm.user_loci__map_render()
    }
    map.setView([
      vm.user_loci.coords.lat,
      vm.user_loci.coords.lon
    ], 12)
    marker.setLatLng([
      vm.user_loci.coords.lat,
      vm.user_loci.coords.lon
    ]).update()
    marker.bindPopup(vm.user_loci.name)
    // .openPopup()
  }

  methods.map_search = function(place) {
    // http://wiki.openstreetmap.org/wiki/Nominatim
    let url = `http://nominatim.openstreetmap.org/search?
      format=jsonv2
      &q=${place}
      &addressdetails=1
    `.split('\n').map(function(str){
      return str.trim()
    }).join('')
    return req({
      method: 'get',
      url,
      json: true
    })
  }

  methods.user_loci__ui_edit = function(){
    let vm = this
    vm.user_loci.ui.search = true
    vm.user_loci.ui.input = vm.user_loci.name
  }

  methods.user_loci__ui_clear = function(){
    let vm = this
    vm.user_loci.ui.input = ''
  }

  methods.user_loci__change_ui = function(e){
    let vm = this
    return vm.user_loci__change(e.target.value)
  }

  methods.user_loci__change = function(place) {
    let vm = this
    vm.map_search(place).then(function(res){
      if (res[0] === undefined) {return}
      vm.user_loci.ui.search = false
      vm.user_loci.name = res[0].display_name
      vm.user_loci.address = res[0].address
      vm.user_loci.coords.lat = Number(res[0].lat)
      vm.user_loci.coords.lon = Number(res[0].lon)
      vm.user_loci__map_refresh()
      console.log(vm.user_loci)
    })
  }
}


// vm.map_search({place: 'Hull, uk'})
