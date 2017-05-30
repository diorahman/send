const url = require('url')
const http = require('http')
const https = require('https')

function fetch (opts, cb) {
  let u = url.parse(opts.uri || opts.url)

  let protocol = u.protocol || ''
  let isHttps = protocol === 'https:'
  let iface = isHttps ? https : http

  let req = iface.request({
    scheme: u.protocol.replace(/:$/, ''),
    method: opts.method || 'GET',
    host: u.hostname,
    port: Number(u.port) || (isHttps ? 443 : 80),
    path: u.path,
    headers: opts.headers || {},
    agent: opts.agent || false,
    withCredentials: false,
    localAdress: opts.localAddress
  })

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
