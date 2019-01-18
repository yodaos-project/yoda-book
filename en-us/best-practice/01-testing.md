# Overview

Effective testing is the foundation for quality assurance. Testing applications in a fast and efficient way is an essential workflow for iterative development of applications.

# Test Classification

1. Functional testing
2. White box testing
3. Stability testing

# Test Methods

## Functional Testing

We offer two methods to test the function , one is to verify the voice interaction through the VUI, and the other is to verify by the mock tool.

> ❕ Note: Functional testing requires network status to be normal

### VUI

First, install the app to the device through the tool;

```bash
$ tools/runtime-install
```

Second, restart vui;

```bash
$ tools/runtime-op --vuid restart
```

Finally, start the interaction and perform a functional test.

```
For example: Rokid, I want to listen to children's songs.
```

### Mock Tool

The mock tool simulates the voice interaction function, and the mock interaction can be achieved through mock.

```bash
$ tools/mock --asr "I want to listen to children's songs"
```

## White Box Testing

White box testing for applications via the [yoda-mock](#yoda-mock-tool) test tool.


```js
'use strict'

var test = require('tape')
var mock = require('@yoda/mock')

test('test app request event', t => {
  var rt
  // start app
  mock.mockAppRuntime('/opt/apps/appdemo')
    .then(runtime => {
      // runtime instance
      rt = runtime
      t.strictEqual(Object.keys(rt.loader.appManifests).length, 1, 'mocked app runtime shall load expected app only')
      // mock ttsd speck method
      rt.mockService('tts', 'speck', (text) => {
        t.strictEqual(text, 'hello')
        t.end()
      })
      // emit app request event
      // @param {string} asr
      // @param {object} nlp
      // @param {object} action
      // @param {object} [options]
      rt.onVoiceCommand('asr', {intent: 'play_song'}, {appId: 'appdemo'}, {})
      // emit app url event
      // @param {string} url
      // @param {object} [options]
      // @param {'cut' | 'scene'} [options.form='cut']
      // @param {boolean} [options.preemptive=true]
      // @param {string} [options.carrierId]
      // @returns {Promise<boolean>}
      rt.openUrl('url', {form: 'cut'})
    })
    .catch(err => {
      t.error(err)
      rt && rt.destruct()
      t.end()
    })
})
```

## Stability Testing

1. Perform a stability testing on your application by executing monkey.

For example, the test object is a music application, which can be tested by calling the mock tool.

```bash
$ tools/mock --asr "I want to listen to Jay Chou's songs"
$ tools/mock --asr 'I want to listen to Daoxiang'
$ tools/mock --asr 'change one'
```

2. Monitor memory and CPU conditions with the memory-viewer tool.

```bash
// memory monitor
$ tools/memory-viewer -m -i 300 -f appname -a
// cpu monitor
$ tools/memory-viewer -c -i 300 -f appname -a
```
Application running data is collected during execution and updated from time to time. Use the following command to convert json to an html chart form.

```bash
$ tools/memory-viewer -r cpu.json
```

# Testing Tools

## Testing Framework

Use tape, see [tape](https://github.com/shadow-node/tape#tape)

## YODA-Mock Tool

The [yoda-mock](https://github.com/Rokid/yoda-mock) tool is used to simulate application runtimes, emulating service methods such as ttsd, lightd.