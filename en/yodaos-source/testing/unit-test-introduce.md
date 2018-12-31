#Unit test articles
> Since yodaOS needs to rely on devices, a Rokid development version is required before unit testing.

## Setting up your test environment
1. Install node and adb (the minimum requirement for adb version is 1.0.32)
2. Execute npm install
3. Create a new test folder test/@yoda

## Create a simple unit test
1. In the test/@yoda file, create a new folder wifi
2. In the wifi folder, create a new demo.test.js

``` js
'use strict'

var test = require('tape')
var wifi = require('@yoda/wifi')
var logger = require('logger')('wifi')

test('type check', function (t) {
  t.equal(typeof wifi.NETSERVER_CONNECTED, 'number')
  t.equal(typeof wifi.NETSERVER_UNCONNECTED, 'number')
  t.equal(typeof wifi.WIFI_CONNECTED, 'number')
  t.equal(typeof wifi.WIFI_INIVATE, 'number')
  t.equal(typeof wifi.WIFI_SCANING, 'number')
  t.equal(typeof wifi.WIFI_UNCONNECTED, 'number')

  t.equal(typeof wifi.getWifiState(), 'number')

  t.equal(typeof wifi.getNetworkState(), 'number')
  t.equal(typeof wifi.getWifiList(), 'object')
  t.equal(typeof wifi.disableAll(), 'number')
  t.equal(typeof wifi.resetDns(), 'boolean')
  t.equal(typeof wifi.scan(), 'boolean')

  t.end()
})
```

## Running unit test code
- $ npm test -- --reporter tap-spec -p '@yoda/wifi/*.test.js'

## Code Style Detection
- $ npm run lint-js


## Recommended test type
- Type check
    - nodejs is a weakly typed language, type checking is necessary
- Parameter check
    - The method returns the same value as expected
