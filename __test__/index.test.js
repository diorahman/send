/* eslint-env jest */
/* global jasmine */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 60

const request = require('../')
const { iterate } = require('leakage')

describe('core', () => {
  it('does not leak', async () => {
    try {
      await iterate.async(async () => {
        const body = await request('http://localhost:5000')
        expect(body).toBeTruthy()
      })
    } catch (err) {
      console.log(err.toString())
    }
  })
})
