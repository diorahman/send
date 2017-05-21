const url = require('url')
const http = require('http')

let agent = false

function fetch (uri, cb) {
  const u = url.parse(uri)
  const bufs = []
  let totalLength = 0

  if (!agent) {
    agent = new http.Agent({ keepAlive: true })
  }

  const req = http.request({
    scheme: u.protocol.replace(/:$/, ''),
    method: 'GET',
    host: u.hostname,
    port: Number(u.port) || 80,
    headers: {},
    agent,
    withCredentials: false,
    localAdress: void 0
  })

  setImmediate(function () {
    req.on('response', function (res) {
      res.on('data', function (buf) {
        bufs.push(buf)
        totalLength += buf.length
      })
      res.on('end', function () {
        cb(null, Buffer.concat(bufs, totalLength))
      })
    })

    req.end()
  })
}

module.exports = fetch
