# ladok-api

> This project version is currently 0.x, meaning that any update can cause any breaking change in its API without any announcement

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
2. `sslOptions`. An object containing the SSL certificate provided by Ladok.

   - If you have a *.pfx* file, pass it in `pfx`
   - If you have a *.cert* file **and** the *.key*, pass them in `cert` and `key`.
   - Additionally, pass a `passphrase` if needed.

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

### ladokApi.requestUrl(endpoint, method, parameters)

Make a request to a certain `endpoint` with a specific `method`. Use `parameters` (the third argument) to pass body parameters.
