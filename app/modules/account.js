module.exports = function({methods, data}){
  w.map = undefined
  w.marker = undefined
  w.layer = undefined

  data.user_map = {}
  data.user_map.show_search = false
  data.user_map.loci = {
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
  data.user_map.input = data.user_map.loci.name

  methods.user_map_init = function() {
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

    marker = L.marker(vm.user_map.loci.coords, {icon}).addTo(map)
    vm.user_map_update(vm.user_map.loci)
  }

  methods.user_map_update = function(loci) {
    map.setView([
      loci.coords.lat,
      loci.coords.lon
    ], 12)
    marker.setLatLng([
      loci.coords.lat,
      loci.coords.lon
    ]).update()
    marker.bindPopup(loci.name)
    // .openPopup()
  }

  methods.map_search = function({place}) {
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

  methods.user_map__edit_click = function(){
    let vm = this
    vm.user_map.show_search = true
    vm.user_map.input = vm.user_map.loci.name
  }

  methods.user_map__clear = function(){
    let vm = this
    vm.user_map.input = ''
  }

  methods.user__change_location = function(e) {
    let vm = this
    vm.map_search({place: e.target.value}).then(function(res){
      console.log('map_search', res)
      if (res[0] === undefined) {return}
      vm.user_map.show_search = false
      vm.user_map.loci.name = res[0].display_name
      vm.user_map.loci.address = res[0].address
      vm.user_map.loci.coords.lat = Number(res[0].lat)
      vm.user_map.loci.coords.lon = Number(res[0].lon)
      vm.user_map_update(vm.user_map.loci)
    })
  }
}


// vm.map_search({place: 'Hull, uk'})
