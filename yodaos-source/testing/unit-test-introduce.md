> 由于yodaOS 需要依赖设备，所以在做单元测试之前， 需要一块Rokid开发版。

## 设置您的测试环境
1. 请先确保存在测试源文件 **test/@yoda/** 。
2. 请确保已经执行过 npm install，确保测试库tape 存在。

## 创建一个简单的单元测试类
1. 在测试源文件中，新建一个文件夹wifi
2. 在wifi文件夹中新建 demo.test.js
```
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
## 运行单元测试代码
- npm test -- --reporter tap-spec -p '@yoda/wifi/*.test.js'

## 代码风格检测
- npm run lint-js


### 建议测试类型
1. 类型检查
    - nodejs 为弱类型语言，类型检查是很有必要的
2. 参数检查
    - 方法返回值是否和预期一样
