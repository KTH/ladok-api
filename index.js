const got = require('got')

module.exports = function LadokApi (baseUrl) {
  async function test () {
    return got('/kataloginformation/anvandare/autentiserad', { baseUrl })
  }

  return {
    test
  }
}
