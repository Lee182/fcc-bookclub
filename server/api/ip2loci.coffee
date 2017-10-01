curl = require('curl')

module.exports = (ip) ->
  url = 'http://ipinfo.io/' + ip + '/json'
  console.log 'ip', ip
  if (
    ip == '::1' or
    ip == '127.0.0.1' or
    ip == undefined or
    ip.match(/^\:\:/) != null
  )
    url = 'http://ipinfo.io/json'
  
  new Promise (resolve, reject) ->
    curl.getJSON url, {}, (err, response, data) ->
      #console.log(data)
      if err
        return reject(err)
      [lat, lon] = data.loc.split(',')
      loci =
        name: """
          #{data.city}, #{data.region}, #{data.country}`
        """
        coords: { lat, lon }
        address:
          city: data.city
          region: data.region
          country_code: data.country.toLowerCase()
      resolve loci