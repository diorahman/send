const http = require('http')
const Promise = require('bluebird')
const request = require('request-promise')

const server = http.createServer(function (req, res) {
  res.write(req.url.slice(1) + '\n')
  setTimeout(res.end.bind(res), 3000)
})

server.listen(5001, function () {
  const reqs = []
  for (let i = 0; i < 100; i++) {
    reqs.push(request('http://localhost:5001/' + i))
  }

  Promise.all(reqs)
    .then(() => { process.exit() })
})

process.stdout.setMaxListeners(0)
