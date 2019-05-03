const got = require('got')

module.exports = function LadokApi (baseUrl, ssl, options = {}) {
  if (!ssl) {
    throw new TypeError('LadokApi requires at least 2 arguments')
  }

  if (!ssl.pfx && !(ssl.cert && ssl.key)) {
    throw new TypeError('Second argument "ssl" must have either "pfx" property or both "cert" and "key"')
  }

  const gotOptions = {
    baseUrl,
    json: true,
    pfx: ssl.pfx,
    cert: ssl.cert,
    key: ssl.key,
    passphrase: ssl.passphrase
  }

  const log = options.log || (() => {})

  async function test () {
    log(`GET /kataloginformation/anvandare/autentiserad`)
    return got('/kataloginformation/anvandare/autentiserad', {
      ...gotOptions,
      headers: {
        'Accept': 'application/vnd.ladok-kataloginformation+json'
      }
    })
  }

  async function requestUrl (endpoint, method = 'GET', parameters) {
    log(`GET ${endpoint}`)
    return got(endpoint, {
      ...gotOptions,
      json: true,
      body: parameters,
      method
    })
  }

  async function * sokPaginated (endpoint, criteria) {
    log(`PUT ${endpoint}`)
    const size = await got(endpoint, {
      ...gotOptions,
      json: true,
      method: 'PUT',
      body: {
        ...criteria,
        Page: 1,
        Limit: 1
      }
    }).then(r => r.body.TotaltAntalPoster)

    log(`PUT ${endpoint} has ${size} results`)

    let page = 0
    while (size > page * 100) {
      page++
      log(`PUT ${endpoint}, page ${page}`)

      const response = await got(endpoint, {
        ...gotOptions,
        json: true,
        method: 'PUT',
        body: {
          ...criteria,
          Page: page,
          Limit: 100
        }
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
