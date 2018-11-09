# 概述

有效的测试是保证质量的基础，通过快速有效的方法对应用进行测试是迭代开发应用程序必不可少的工作流程。

# 测试分类

1. 功能测试
2. 白盒测试
3. 稳定性测试

# 测试方法

## 功能测试

功能测试我们提供2种方式，一是通过 VUI 进行语音交互进行验证，二是通过 mock 工具进行验证。

> ❕注意：功能测试，需要网络状态处于正常状态

### VUI 

首先，通过工具将应用安装到设备；

```bash
# tools/runtime-install
```

其次，重启 vui ；

```bash
# tools/runtime-op --vuid restart
```

最后，开始交互，进行功能测试。

```
例如：若琪，我要听儿歌。
```

### mock 工具

mock 工具可以模拟语音交互功能，通过 mock 可达到语音交互的效果。

```bash
# tools/mock --asr '我要听儿歌'
```

## 白盒测试

通过 MockAppRuntime 测试工具进行针对应用的白盒测试。


```js
'use strict'

var test = require('tape')
var Mock = require('@yoda/mock')

test('test app request event', t => {
  var rt
  // start app
  Mock.mockAppRuntime('/opt/apps/appdemo')
    .then(runtime => {
      // runtime instance
      rt = runtime
      t.strictEqual(Object.keys(runtime.loader.appManifests).length, 1, 'mocked app runtime shall load expected app only')
      // mock ttsd speck method
      runtime.mockService('tts', 'speck', (text) => {
        t.strictEqual(text, 'hello')
        t.end()
      })
      // emit app request event
      // @param {string} asr
      // @param {object} nlp
      // @param {object} action
      // @param {object} [options]
      runtime.onVoiceCommand('asr', {intent: 'play_song'}, {appId: 'appdemo'}, {})
      // emit app url event
      // @param {string} url
      // @param {object} [options]
      // @param {'cut' | 'scene'} [options.form='cut']
      // @param {boolean} [options.preemptive=true]
      // @param {string} [options.carrierId]
      // @returns {Promise<boolean>}
      runtime.openUrl('url', {form: 'cut'})
    })
    .catch(err => {
      t.error(err)
      rt && rt.destruct()
      t.end()
    })
})
```

## 稳定性测试

1. 通过执行 monkey 针对应用进行稳定性测试。

例如：测试对象为音乐应用，可以通过调用 mock 工具进行测试。

```bash
# tools/mock --asr '我要听周杰伦的歌'
# tools/mock --asr '我要听稻香'
# tools/mock --asr '换一个'
```

2. 通过 memory-viewer 工具监控内存和 CPU 情况

```bash
// memory monitor
# tools/memory-viewer -m -i 300 -f appname -a
// cpu monitor
# tools/memory-viewer -c -i 300 -f appname -a
```
执行中会采集应用运行数据，并时时更新。通过如下命令可将 json 转换为 html 图表形式。

```bash
# tools/memory-viewer -r cpu.json
```

# 测试工具

## 测试框架

采用 tape，详见  [tape](https://github.com/shadow-node/tape#tape)  使用说明

## yoda-mock 工具

[yoda-mock](https://github.com/Rokid/yoda-mock) 工具用于模拟应用运行时，模拟 ttsd，lightd 等服务方法。

