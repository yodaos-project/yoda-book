# 单元测试篇
> 由于yodaOS 需要依赖设备，所以在做单元测试之前， 需要一块Rokid开发版。

## 设置您的测试环境
1. 安装 node 和 adb(adb版本最低要求为 1.0.32)
2. 执行 npm install
3. 新建测试文件夹 test/@yoda

## 创建一个简单的单元测试
1. 在test/@yoda文件中，新建一个文件夹wifi
2. 在wifi文件夹中, 新建 demo.test.js

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

## 运行单元测试代码
- $ npm test -- --reporter tap-spec -p '@yoda/wifi/*.test.js'

## 代码风格检测
- $ npm run lint-js


## 建议测试类型
- 类型检查
    -  nodejs 为弱类型语言，类型检查是很有必要的
- 参数检查
    - 方法返回值是否和预期一样
