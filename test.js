const test = require('ava')
const nock = require('nock')

const LadokApi = require('.')

test('The "test" method should reach the right endpoint', async t => {
  t.timeout(100)
  const scope = nock('http://ladok.example')
    .get('/kataloginformation/anvandare/autentiserad')
    .reply(200, {})

  const ladok = LadokApi('http://ladok.example', { pfx: 'some pfx file' })
  try {
    await ladok.test()
    t.truthy(scope.isDone())
  } catch (e) {
    throw e
  }
})
