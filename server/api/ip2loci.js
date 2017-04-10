const curl = require('curl')

module.exports = function ip2map(ip) {
  var url = 'http://ipinfo.io/'+ip+'/json'
  if (ip === '::1' || ip === '127.0.0.1' || ip === undefined) {
    url = 'http://ipinfo.io/json'
  }
  return new Promise(function(resolve, reject){

  curl.getJSON(url, {}, function(err, response, data){
    //console.log(data)
    if (err) {return reject(err)}
    var loc = data.loc.split(',')
    var loci = {
      name: data.city + ', ' + data.region + ', ' + data.country,
      coords: {
        lat: Number(loc[0]),
        lon: Number(loc[1])
      },
      address: {
        city: data.city,
        region: data.region,
        country_code: data.country.toLowerCase()
      }
    }
    resolve(loci)
  })

  })
}
