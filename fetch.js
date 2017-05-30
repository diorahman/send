const url = require('url')
const http = require('http')
const https = require('https')

function fetch (opts = Object.create(null), cb) {
  let u = url.parse(opts.uri || opts.url)

  let protocol = u.protocol || ''
  let isHttps = protocol === 'https:'
  let iface = isHttps ? https : http
  let options = Object.create(null)

  options.scheme = u.protocol.replace(/:$/, '')
  options.method = opts.method || 'GET'
  options.host = u.hostname
  options.port = Number(u.port) || (isHttps ? 443 : 80)
  options.path = u.path
  options.headers = opts.headers || Object.create(null)
  options.agent = opts.agent || false
  options.withCredentials = false
  options.localAdress = opts.localAddress

  if (typeof opts.body === 'string') {
    options.headers['Content-Length'] = Buffer.byteLength(opts.body)
  }

  let req = iface.request(options)
  req.setTimeout(opts.timeout || Math.pow(2, 32) * 1000)

  setImmediate(function () {
    req.once('error', cb)

    let totalLength = 0
    let bufs = []
    let response = void 0

    req.once('timeout', function () {
      let err = new Error('ETIMEDOUT')
      err.code = 'ETIMEDOUT'
      err.connect = req.socket && req.socket.readable === false

      if (req) {
        req.abort()
      }

      if (response) {
        response.destroy()
      }

      cb(err)

      bufs.length = 0
    })

    req.once('response', function (res) {
      response = res
      res.on('data', function (buf) {
        bufs.push(buf)
        totalLength += buf.length
      })

      res.once('end', function () {
        let r = Object.create(null)
        r.headers = response.headers
        r.statusCode = response.statusCode
        r.body = Buffer.concat(bufs, totalLength)
        cb(null, r)

        bufs.length = 0
      })
    })

    if (typeof opts.body === 'string') {
      req.write(opts.body)
    }

    req.end()
  })
}

module.exports = fetch
