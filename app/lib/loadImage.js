module.exports = function(src) {
  return new Promise(function(resolve, reject) {
    var img = document.createElement('img')
    img.onload = function() {
      resolve(e)
    }
    img.onerror = function(e) {
      reject(e)
    }
    img.src = src
  })
}
