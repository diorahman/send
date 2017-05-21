const fetch = require('./fetch')

function request (options) {
  return new Promise(function (resolve, reject) {
    fetch(options, function responseHandler (err, data) {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

request.get = function () {}

module.exports = request
