# 概述

有效的测试是保证质量的基础，通过快速有效的方法对应用进行测试是迭代开发应用程序必不可少的工作流程。

## 撰写第一条单元测试

假设我们的应用代码目录有如下结构：

```
-- ~/awesome-app
   |- package.json
   |
   |- /test
   |  |- cool-func.test.js
   |
   |- /src
   |  |- app.js
   |  |- cool-func.js
```

如果我们在 `~/awesome-app/src/cool-func.js` 有以下一个函数，我们希望测试她的输出，
```js
module.exports = function coolFunc () {
  return 'happy testing'
}
```

那么我们将在 `~/awesome-app/test/cool-func.test.js` 开始撰写我们的第一条测试用例：

```js
var test = require('@yodaos/mm').test
var coolFunc = require('../src/cool-func')

test('happy testing', t => {
  t.strictEqual(coolFunc(), 'happy testing')
  t.end()
})
```

## 运行单元测试

首先，通过 yoda-cli 将应用代码与测试用例安装到设备：

```bash
~/awesome-app > yoda-cli pm install .
```

然后将应用通过 instrument 模式启动，同时开始监听应用的输出：

```bash
~/awesome-app > yoda-cli am instrument awesome-app 'test/*.test.js'
~/awesome-app > yoda-cli am logread awesome-app
✔  success   instrument
{ appId: 'cloud-player', mode: 'instrument' }
TAP version 13
ok 1 strict equal

1..1
# tests 1
# pass  1
# ok
```

看起来测试通过！
