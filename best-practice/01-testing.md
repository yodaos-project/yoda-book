# 应用测试
[TOC]

## 概述

有效的测试是保证质量的基础，通过快速有效的方法对应用进行测试是迭代开发应用程序必不可少的工作流程。

## 测试分类

1. 功能测试
2. 白盒测试
3. 稳定性测试

## 测试方法

### 1. 功能测试

功能测试我们提供2种方式，一是通过VUI进行语音交互进行验证，二是通过 mock 工具进行验证。

> ❕注意：功能测试，需要网络状态处于正常状态

#### VUI 

首先，通过工具将应用安装到设备；

```
tools/runtime-install
```

其次，重启vui；

```
tools/runtime-op --vuid restart
```

最后，开始交互，进行功能测试。

```
例如：若琪，我要听儿歌。
```

#### mock 工具

mock 工具可以模拟语音交互功能，通过mock 可达到语音交互的效果。

```
tools/mock --asr '我要听儿歌'
```

### 2. 白盒测试

通过MockAppRuntime测试工具进行针对应用的白盒测试。


```
var test = require('tape')
var Mock = require('@yoda/mock')

test('test app request event', t => {
  var rt
  try {
    // 启动应用
    Mock.mockAppRuntime('/opt/apps/appdemo')
      .then(runtime => {
        // 运行时实例
        rt = runtime
        t.strictEqual(Object.keys(runtime.loader.appManifests).length, 1, 'mocked app runtime shall load expected app only')
        // mock tts 服务的 speck 方法
        runtime.mockService('tts', 'speck', (text) => {
          t.strictEqual(text, '你好')
          t.end()
        })
        // 触发 app 的 request 事件
        // @param {string} asr 语音识别后的文字
        // @param {object} nlp 服务端返回的NLP
        // @param {object} action 服务端返回的action
        // @param {object} [options]
        runtime.onVoiceCommand(asr,nlp,action,options)
        // 触发 app 的 url 事件
        // @param {string} url
        // @param {object} [options]
        // @param {'cut' | 'scene'} [options.form='cut']
        // @param {boolean} [options.preemptive=true]
        // @param {string} [options.carrierId]
        // @returns {Promise<boolean>}
        runtime.openUrl(url,options)
      .catch(err => {
        t.error(err)
        rt && rt.destruct()
        t.end()
      })
  } catch (err) {
    t.error(err)
    rt && rt.destruct()
    t.end()
  }
})
```


### 3. 稳定性测试

1. 通过执行 monkey 针对应用进行稳定性测试。

例如：测试对象为音乐应用，可以通过调用 mock 工具进行测试。

```
./mock --asr '我要听周杰伦的歌'
./mock --asr '我要听稻香'
./mock --asr '换一个'
```

2. 通过 memory-viewer 工具监控内存和 CPU 情况

```
// 内存
./memory-viewer -m -i 300 -f appname -a
// CPU
./memory-viewer -c -i 300 -f appname -a
```
执行中会采集应用运行数据，并时时更新。通过如下命令可将 json 转换为 html 图标形式。

```
./memory-viewer -r cpu.json
```

## 测试工具

### 测试框架

采用tape，详见 tape 使用说明

###  yoda-mock 工具

MockAppRuntime用于模拟应用运行时，模拟ttsd，lightd 等服务方法。

