const fetch = require('./fetch')
const qs = require('querystring')

function request (opts = Object.create(null)) {
  return new Promise(function (resolve, reject) {
    fetch(opts, function responseHandler (err, data) {
      if (err) {
        return reject(err)
      }

      let ret = Object.create(null)
      ret.statusCode = data.statusCode
      ret.headers = data.headers

      if (/json/.test(data.headers['content-type'])) {
        try {
          ret.body = JSON.parse(data.body)
        } catch (err) {
          // returns the Buffer
          ret.body = data.body
        }
      } else {
        ret.body = data.body
      }
      resolve(ret)
      data = null
    })
  })
}

function make (method, url, opts = Object.create(null)) {
  let uri = url
  let q = opts.query || opts.qs

  if (q) {
    uri = uri + '?' + qs.stringify(q)
  }

  let headers = Object.create(null)
  headers['Content-Type'] = opts.json ? 'application/json' : 'application/x-www-form-urlencoded'
  let options = Object.create(null)
  options.method = method
  options.headers = headers
  options.uri = uri
  options = Object.assign(options, opts)

  options.body = options.json ? JSON.stringify(options.body) : qs.stringify(options.body)
  return options
}

request.get = function (uri, opts) {
  return request(make('GET', uri, opts))
}

request.post = function (uri, body, opts) {
  let data = Object.create(null)
  data.body = body

  let made = make('POST', uri, Object.assign(data, opts))
  return request(made)
}

request.put = function (uri, body, opts) {
  let data = Object.create(null)
  data.body = body

  let made = make('PUT', uri, Object.assign(data, opts))
  return request(made)
}

request.patch = function (uri, body, opts) {
  let data = Object.create(null)
  data.body = body

  let made = make('PATCH', uri, Object.assign(data, opts))
  return request(made)
}

request.delete = function (uri, body, opts) {
  let data = Object.create(null)
  data.body = body

  let made = make('DELETE', uri, Object.assign(data, opts))
  return request(made)
}

module.exports = request
