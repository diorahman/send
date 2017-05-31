/* eslint-env jest */
/* global jasmine */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 60

const request = require('../')

async function create () {
  const {body} = await request.post('https://requestb.in/api/v1/bins')
  return {
    url: `https://requestb.in/${body.name}`,
    name: body.name
  }
}

async function get (name) {
  const {body} = await request.get(`https://requestb.in/api/v1/bins/${name}/requests`)
  return body.pop()
}

test('timeout', async () => {
  try {
    await request({ timeout: 1, url: 'https://hooq.tv' })
  } catch (err) {
    expect(err.code).toEqual('ETIMEDOUT')
  }
})

test('urlencoded', async () => {
  const payload = {
    email: 'kayden75@yahoo.com'
  }

  const {url, name} = await create()
  const {statusCode} = await request.post(url, payload)
  const sent = await get(name)

  expect(statusCode).toEqual(200)
  expect(sent.headers['Content-Type']).toEqual('application/x-www-form-urlencoded')
})

test('patch', async () => {
  const payload = {
    email: 'kayden75@yahoo.com'
  }

  const {url} = await create()
  const {statusCode} = await request.patch(url, payload)
  expect(statusCode).toEqual(200)
})

test('delete', async () => {
  const payload = {
    email: 'kayden75@yahoo.com',
    dump: 1
  }

  const {url} = await create()
  const {statusCode} = await request.delete(url, { query: payload })
  expect(statusCode).toEqual(200)
})

test('get', async () => {
  const payload = {
    email: 'kayden75@yahoo.com',
    dump: 1
  }

  const {url} = await create()
  const {statusCode} = await request.get(url, { query: payload })
  expect(statusCode).toEqual(200)
})

test('json', async () => {
  const payload = {
    service: 'HAHA',
    email: 'kayden75@yahoo.com',
    paymentMethodInfo: {
      label: 'HAHA',
      transactionReferenceMsg: {
        amount: '123456',
        txID: '1234567',
        txMsg: 'Success'
      }
    }
  }

  const {url, name} = await create()
  const {statusCode} = await request.post(url, payload, { json: true, headers: { OK: 1 } })
  const sent = await get(name)
  expect(statusCode).toEqual(200)
  expect(typeof sent.body === 'string' ? JSON.parse(sent.body) : sent.body).toEqual(payload)
})

test('get with qs', async () => {
  const {url, name} = await create()
  const {statusCode} = await request.get(url, {
    qs: {
      dump: 1
    }
  })
  const sent = await get(name)
  expect(statusCode).toEqual(200)
  expect(sent.query_string).toEqual({ dump: [ '1' ] })
})

test('get with query', async () => {
  const {url, name} = await create()
  const {statusCode} = await request.get(url, {
    query: {
      dump: 1
    }
  })
  const sent = await get(name)
  expect(statusCode).toEqual(200)
  expect(sent.query_string).toEqual({ dump: [ '1' ] })
})

test('get with qs one param', async () => {
  const uri = 'http://posttestserver.com/post.php'
  const {body} = await request.get(uri, {
    qs: {
      dump: 1
    }
  })
  expect(body.toString().indexOf('REQUEST_URI') >= 0).toBe(true)

  const realUri = body.toString().match(/REQUEST_URI = (.+)/)[1] || ''
  expect(realUri.match(/dump=1/g).length).toBe(1)
})

test('custom ua', async () => {
  const uri = 'http://posttestserver.com/post.php?dump'
  const {body} = await request.post(uri, {ok: 1}, {headers: {'User-Agent': 'Hihi'}})
  expect(body.toString().indexOf('HTTP_USER_AGENT = Hihi') >= 0).toBe(true)
})

test('https', async () => {
  const uri = 'https://rest.bandsintown.com/artists'
  const {body} = await request.get(uri)
  expect(body.message).toBeTruthy()
})

test('cancel', (done) => {
  const uri = 'https://rest.bandsintown.com/artists'
  const req = request.get(uri)
    .finally(() => {
      expect(req._cancellationParent.monitor.req.aborted).toBeTruthy()
      done()
    })
  setTimeout(function () {
    req.cancel()
    // we should have access to req object if we want to be sure
    expect(req.isCancelled()).toBeTruthy()
  }, 1)
})
