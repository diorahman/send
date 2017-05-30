const fetch = require('../fetch')
const opts = {
  method: 'POST',
  url: 'http://posttestserver.com/post.php?dump',
  body: JSON.stringify({ok: 1}),
  headers: {
    'Content-Type': 'application/json'
  }
}

fetch(opts, handler)

function handler (err, data) {
  if (!err) {
    console.log(data.body.toString())
  }
}
