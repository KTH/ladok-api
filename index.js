const got = require('got')
const assert = require('assert').strict

function removeSSL (err) {
  delete err.gotOptions
  return err
}

module.exports = function LadokApi (baseUrl, ssl, options = {}) {
  assert.equal(typeof baseUrl, 'string', new TypeError(`First argument "baseUrl" expected to be a string. Obtained ${typeof baseUrl}`))
  assert.ok(
    ssl.pfx || (ssl.cert && ssl.key),
    new TypeError('Second argument "ssl" must be an object with either {pfx} or {cert, key}')
  )

  const ladokGot = got.extend({
    baseUrl,
    json: true,
    pfx: ssl.pfx,
    cert: ssl.cert,
    key: ssl.key,
    passphrase: ssl.passphrase
  })

  const log = options.log || (() => {})

  async function test () {
    log(`GET /kataloginformation/anvandare/autentiserad`)
    try {
      const response = await ladokGot('/kataloginformation/anvandare/autentiserad', {
        headers: {
          'Accept': 'application/vnd.ladok-kataloginformation+json'
        }
      })

      return response
    } catch (e) {
      if (e.name === 'RequestError' && e.message === 'mac verify failure') {
        e.message = 'Error decoding certificate. Check the "ssl" argument passed when building the instance'
      }
      throw removeSSL(e)
    }
  }

  async function requestUrl (endpoint, method = 'GET', parameters) {
    log(`${method} ${endpoint}`)

    try {
      const response = await ladokGot(endpoint, {
        json: true,
        body: parameters,
        method
      })

      return response
    } catch (e) {
      throw removeSSL(e)
    }
  }

  async function * sokPaginated (endpoint, criteria) {
    log(`PUT ${endpoint}`)
    const size = await requestUrl(endpoint, 'PUT', {
      ...criteria,
      Page: 1,
      Limit: 1
    }).then(r => r.body.TotaltAntalPoster)

    log(`PUT ${endpoint} has ${size} results`)

    let page = 0
    while (size > page * 100) {
      page++
      log(`PUT ${endpoint}, page ${page}`)

      const response = await requestUrl(endpoint, 'PUT', {
        ...criteria,
        Page: page,
        Limit: 100
      })

      yield response
    }
  }

  async function * sok (endpoint, criteria) {
    for await (let page of sokPaginated(endpoint, criteria)) {
      for (let element of page.body.Resultat) {
        yield element
      }
    }
  }

  return {
    test,
    requestUrl,
    sokPaginated,
    sok
  }
}
