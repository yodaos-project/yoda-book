# Overview

Effective testing is the foundation for quality assurance. Testing applications in a fast and efficient way is an essential workflow for iterative development of applications.

#测试分类

Functional test
2. White box test
3. Stability test

# Test Methods

## function test

Functional Testing We offer two methods, one is to verify the voice interaction through the VUI, and the other is to verify by the mock tool.

> ❕ Note: Functional test requires network status to be normal

### VUI

First, install the app to the device through the tool;

```bash
# tools/runtime-install
```

Second, restart vui;

```bash
# tools/runtime-op --vuid restart
```

Finally, start the interaction and perform a functional test.

```
For example: Ruo Qi, I want to listen to children's songs.
```

### mock tool

The mock tool simulates the voice interaction function, and the mock interaction can be achieved through mock.

```bash
# tools/mock --asr 'I want to listen to children's songs'
```

##白盒测试

White box testing for applications via the [yoda-mock](#yoda-mock-tool) test tool.


```js
'use strict'

Var test = require('tape')
Var Mock = require('@yoda/mock')

Test('test app request event', t => {
  Var rt
  // start app
  Mock.mockAppRuntime('/opt/apps/appdemo')
    .then(runtime => {
      // runtime instance
      Rt = runtime
      t.strictEqual(Object.keys(runtime.loader.appManifests).length, 1, 'mocked app runtime shall load expected app only')
      // mock ttsd speck method
      runtime.mockService('tts', 'speck', (text) => {
        t.strictEqual(text, 'hello')
        T.end()
      })
      // emit app request event
      @param {string} asr
      @param {object} nlp
      @param {object} action
      @param {object} [options]
      runtime.onVoiceCommand('asr', {intent: 'play_song'}, {appId: 'appdemo'}, {})
      // emit app url event
      @param {string} url
      @param {object} [options]
      @param {'cut' | 'scene'} [options.form='cut']
      @param {boolean} [options.preemptive=true]
      @param {string} [options.carrierId]
      @returns {Promise<boolean>}
      runtime.openUrl('url', {form: 'cut'})
    })
    .catch(err => {
      T.error(err)
      Rt && rt.destruct()
      T.end()
    })
})
```

## Stability test

1. Perform a stability test on your application by executing monkey.

For example, the test object is a music application, which can be tested by calling the mock tool.

```bash
# tools/mock --asr 'I want to listen to Jay Chou's songs'
# tools/mock --asr 'I want to listen to Daoxiang'
# tools/mock --asr 'change one'
```

2. Monitor memory and CPU conditions with the memory-viewer tool

```bash
// memory monitor
# tools/memory-viewer -m -i 300 -f appname -a
// cpu monitor
# tools/memory-viewer -c -i 300 -f appname -a
```
Application running data is collected during execution and updated from time to time. Use the following command to convert json to an html chart form.

```bash
# tools/memory-viewer -r cpu.json
```

# test tools

## Testing framework

Use tape, see [tape](https://github.com/shadow-node/tape#tape)

## yoda-mock tool

The [yoda-mock](https://github.com/Rokid/yoda-mock) tool is used to simulate application runtimes, emulating service methods such as ttsd, lightd.