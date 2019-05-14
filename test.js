const test = require('ava')
const nock = require('nock')

const LadokApi = require('.')

test('Second argument is mandatory', t => {
  t.throws(() => { LadokApi('https://ladok.example') }, TypeError)
})

test('Second argument must contain "pfx" or "cert"+"key"', t => {
  t.throws(() => {
    LadokApi('https://ladok.example', {})
  }, TypeError)

  t.throws(() => {
    LadokApi('https://ladok.example', { cert: 'hey' })
  }, TypeError)

  t.notThrows(() => {
    LadokApi('https://ladok.example', { pfx: 'some pfx' })
  }, TypeError)

  t.notThrows(() => {
    LadokApi('https://ladok.example', { cert: 'hey', key: 'something' })
  }, TypeError)
})

test('The "test" method should reach the right endpoint', async t => {
  t.timeout(100)
  const scope = nock('http://ladok.example')
    .get('/kataloginformation/anvandare/autentiserad')
    .reply(200, {})

  const ladok = LadokApi('http://ladok.example', { pfx: 'some pfx file' })
  await ladok.test()
  t.truthy(scope.isDone())
})

test('Pfx content nor passphrase must not leak when throwing errors', async t => {
  t.plan(2)
  const ladok = LadokApi('https://api.test.ladok.se', {
    pfx: Buffer.from('some_string'),
    passphrase: 'aaa'
  })

  try {
    await ladok.test()
  } catch (err) {
    const error = JSON.stringify(err)
    t.notRegex(error, /pfx/)
    t.notRegex(error, /passphrase/)
  }
})

test('cert or key must not leak when throwing errors', async t => {
  t.plan(2)
  const ladok = LadokApi('https://api.test.ladok.se', {
    cert: 'secret_cert',
    key: 'secret_key'
  })

  try {
    await ladok.test()
  } catch (err) {
    const error = JSON.stringify(err)
    t.notRegex(error, /secret_cert/)
    t.notRegex(error, /secret_key/)
  }
})
