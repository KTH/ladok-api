const got = require('got')
const augmentGenerator = require('./lib/augmentGenerator')

function removeSSL (err) {
  delete err.gotOptions
  return err
}

module.exports = function LadokApi (baseUrl, ssl, options = {}) {
  if (!ssl) {
    throw new TypeError('LadokApi requires at least 2 arguments')
  }

  if (!ssl.pfx && !(ssl.cert && ssl.key)) {
    throw new TypeError('Second argument "ssl" must have either "pfx" property or both "cert" and "key"')
  }

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
      throw removeSSL(e)
    }
  }

  async function requestUrl (endpoint, method = 'GET', body, attributes) {
    log(`${method} ${endpoint}`)

    try {
      const response = await ladokGot(endpoint, {
        json: true,
        body,
        method,
        ...attributes
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

  async function * sok (endpoint, criteria, key) {
    for await (let page of sokPaginated(endpoint, criteria)) {
      for (let element of page.body[key]) {
        yield element
      }
    }
  }

  return {
    test,
    requestUrl,
    sokPaginated: augmentGenerator(sokPaginated),
    sok: augmentGenerator(sok)
  }
}
