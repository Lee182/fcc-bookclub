module.exports = function({
  method,  // get, post, put, delete
  url,     // relative url or full path
  data,    // if post req sets body as data
  cookies,
  timeout,
  json,
  cb_progress,
  cb_readystate
}) {
  if (method === undefined) {method = 'get'}
  var req = new XMLHttpRequest()
  var p = new Promise(function(resolve, reject){
    var timer
    req.addEventListener('readystatechange', function(e){
      if (typeof cb_readystate === 'function') {
        cb_readystate(e)
      }
      if (req.readyState === 4) {
        clearTimeout(timer)
        if (json) {
          try {
            var res = JSON.parse(req.response)
          } catch(e) {
            // unable to parse res
            return reject(e)
          }
          return resolve(res)
        }
        return resolve(req.response)
      }
    })
    if (typeof cb_progress === 'function') {
      req.upload.addEventListener('progress', cb_progress)
    }
    req.addEventListener('error', function(e) {
      reject(e)
    })
    req.open('get', url, true)
    req.withCredentials = Boolean(cookies)
    if (json === true) {
      req.setRequestHeader('Accept', 'application/json')
    }

    if (isNaN(timeout) === false) {
      timer = setTimeout(function(){
        req.abort()
        reject(timeout+'ms timeout')
      },timeout)
    }
    if (data === undefined || data === null) {
      req.send()
      return
    }
    var data2 = (typeof data === 'object') ? JSON.stringify(data) : data.toString()

    req.send(data2)
  })
  p.req = req
  p.cancel = req.abort
  return p
}
