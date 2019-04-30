const got = require('got')

module.exports = function LadokApi (baseUrl, ssl) {
  let options = {
    baseUrl,
    json: true,
    headers: {
      'Accept': 'application/vnd.ladok-kataloginformation+json'
    }
  }

  if (!ssl) {
    throw new TypeError('LadokApi requires at least 2 arguments')
  }

  if (ssl.pfx) {
    options.pfx = ssl.pfx
  } else if (ssl.cert && ssl.key) {
    options.cert = ssl.cert
    options.key = ssl.key
  } else {
    throw new TypeError('Second argument "ssl" must have either "pfx" property or both "cert" and "key"')
  }

  options.passphrase = ssl.passphrase

  async function test () {
    return got('/kataloginformation/anvandare/autentiserad', options)
  }

  async function requestUrl (endpoint, method = 'GET', parameters) {
    return got(endpoint, {
      ...options,
      json: true,
      body: parameters,
      method
    })
  }

  async function * sokPaginated (endpoint, criteria) {
    const size = await got(endpoint, {
      ...options,
      json: true,
      method: 'PUT',
      body: {
        ...criteria,
        Page: 1,
        Limit: 1
      }
    }).then(r => r.body.TotaltAntalPoster)

    let page = 0
    while (size > page * 100) {
      page++

      const response = await got(endpoint, {
        ...options,
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

  return {
    test,
    requestUrl,
    sokPaginated
  }
}
