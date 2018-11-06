# 开始编写你的第一个应用

## 程序入口：Main 函数

对于 YodaOS 来说，每个应用都是一个。每一个 CommonJS 模块都会有一个对 `module.exports` 的引用，YodaOS 的应用也同样的，他的主入口即为通过 `module.exports` 导出的一个接收一个 `activity` 作为参数的函数。

```javascript
module.exports = function main (activity) {

}
```

应用通过系统框架提供的 `activity` 对象来与系统交互，如接收系统、应用事件，调用系统 API。

### 与 YodaOS 交互

系统框架提供的 `activity` 是一个符合 Node.js EventEmitter API 的对象，在其上我们可以监听任意一个应用的生命周期事件：

```javascript
module.exports = function main (activity) {
  activity.on('create', () => {
    /** do initialization on event `create` */
  })
}
```

> 查看更多生命周期文档：[生命周期](./02-lifetime.md)

## 应用描述：Package.json

除了程序代码，应用还需要向声明自己的身份、权限请求等信息，以便 YodaOS 向应用分配资源、分发 NLP 等。YodaOS 应用的 package.json 就包含了这些信息：

```json
{
  "name": "com.company.example.awesome-app",
  "version": "1.0.0",
  "main": "app.js",
  "manifest": {
    "skillIds": [
      "an-pre-registered-skill-id"
    ],
    "permission": [
      "ACCESS_TTS",
      "ACCESS_MULTIMEDIA"
    ]
  }
}
```

Package.json 类似于 npm 包，但是对于 YodaOS 应用来说，其中最重要的字段莫过于 name 与 manifest：前者声明了应用的本地 ID，后者声明了需要向 YodaRuntime 申请的权限、技能 ID等信息。

> 查看更多 Package.json 描述文档：[应用 Manifest](./04-app-manifest.md)
