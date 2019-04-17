# ladok-api

## Usage

``` javascript
const LadokApi = require('@kth/ladok-api')
const fs = require('fs')

async function start () {
  const ladok = LadokApi(process.env.LADOK_API_BASE_URL, {
    pfx: fs.readFileSync('./my-certificate.pfx'),
    passphrase: process.env.LADOK_API_CERT_PASSPHRASE
  })

  console.log((await ladok.test()).body)
}

start()
```

## API

### LadokApi(baseUrl, sslOptions)

Returns a LadokApi instance. Two arguments are required:

1. `baseUrl`. The base URL for calls performed by the instance.
2. `sslOptions`. An object containing the SSL certificate provided by Ladok. The object accept up to two properties: `pfx` and `passphrase`.

   - `pfx` is the content of a PFX certificate.
   - `passphrase` is the password to open the certificate.

``` javascript
const ladok = LadokApi(process.env.LADOK_API_BASE_URL, {
  pfx: fs.readFileSync('./my-certificate.pfx'),
  passphrase: process.env.LADOK_API_CERT_PASSPHRASE
})
```

## Instance methods

### ladokApi.test()

Make a request to the `/kataloginformation/anvandare/autentiserad`  endpoint in Ladok. Useful when you want to check that you have set up the environment properly.

If everything goes well, it returns a string with the response of the mentioned endpoint.

``` javascript
const response = (await ladok.test()).body
```
