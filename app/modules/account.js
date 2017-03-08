module.exports = function({methods, data}){
  w.map = undefined
  w.marker = undefined

  data.user_map = {}
  data.user_map.show_search = false
  data.user_map.loci = {
    name: 'Mansfield, GB',
    coords: {
      lat: 53.135051,
      lon: -1.2159578
    },
    address: {
      "road": "Washington Drive",
      "suburb": "Mansfield Woodhouse",
      "town": "Nottinghamshire",
      "state_district": "East Midlands",
      "state": "England",
      "country": "United Kingdom",
      "country_code": "gb"
    }
  }

  methods.user_map_init = function() {
    let vm = this
    map = L.map(d.qs('.profile-map'))

    var icon = L.icon({
      iconUrl: 'http://www.clker.com/cliparts/H/L/G/C/a/D/pin.svg',
      iconSize: [58, 48],
      iconAnchor: [18, 42],
      popupAnchor: [0, -28]
    })

    L.tileLayer('https://api.mapbox.com/styles/v1/lee182/cj002grxo00kq2spfvxdk64p6/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVlMTgyIiwiYSI6ImNqMDAyZmJ6MDAwNXkycXQwNDM2MTZhankifQ.tWdE2srazZzTryC4DPTQfw', {
        attribution: '',
        maxZoom: 15,
        minZoom: 3
    }).addTo(map)

    marker = L.marker(data.user_map.loci.coords, {icon}).addTo(map)
      .bindPopup(data.user_map.loci.name)
      // .openPopup()

    vm.user_map_update()
  }

  methods.user_map_update = function() {
    map.setView(data.user_map.loci.coords, 12)
    marker.setLatLng(data.user_map.loci.coords).update()
  }

  methods.map_search = function({place}) {
    // http://wiki.openstreetmap.org/wiki/Nominatim
    let url = `http://nominatim.openstreetmap.org/search?
      format=jsonv2
      &q=${place}
      &addressdetails=1
    `.split('\n').map(String.trim).join('')
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
      vm.user_map.loci.address = res.address
      vm.user_map.loci.coords.lat = res[0].lat
      vm.user_map.loci.coords.lon = res[0].lon

      vm.user_map_update()
    })
  }
}


// vm.map_search({place: 'Hull, uk'})
