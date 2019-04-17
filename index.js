const got = require('got')

module.exports = function LadokApi (baseUrl, ssl) {
  let options = {
    baseUrl
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

  return {
    test
  }
}
