## 程序入口：Main 函数

对于 YodaOS 来说，每个应用都是一个 [CommonJS](https://nodejs.org/docs/latest/api/modules.html) 模块。每一个 CommonJS 模块都会有一个对 `module.exports` 的引用，YodaOS 的应用也同样的，他的主入口即为通过 `module.exports` 导出的一个接收一个 `activity` 作为参数的函数。

```javascript
module.exports = function main (activity) {

}
```

应用通过系统框架提供的 `activity` 对象来与系统交互，如接收系统、应用事件，调用系统 API。

### 与 YodaOS 交互

系统框架提供的 `activity` 是一个符合 Node.js [EventEmitter API](https://nodejs.org/docs/latest/api/events.html#events_events) 的对象，在其上我们可以监听任意一个应用的生命周期事件：

```javascript
module.exports = function main (activity) {
  activity.on('create', () => {
    /** do initialization on event `create` */
  })

  activity.on('request', () => {
    activity.tts.speak('Hello World')
  })
}
```

> 查看更多生命周期文档：[生命周期](./02-lifetime.md)

## 应用 Manifest

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

package.json 类似于 [npm](https://www.npmjs.com/) 包，但是对于 YodaOS 应用来说，其中最重要的字段莫过于 name 与 manifest：前者声明了应用的本地 ID，后者声明了需要向 YodaRuntime 申请的权限、技能 ID等信息。

> 查看更多 package.json 描述文档：[应用 Manifest](./04-app-manifest.md)

## 处理语音请求

在若琪开发者网站编写完 NLP 匹配规则后，就可以在应用代码中编写如下的代码来处理这个语音请求：

```javascript
module.exports = function main (activity) {
  activity.on('request', nlp => {
    activity.tts.speak(`Hello, ${nlp.slots.value}`)
  })
}
```

## 处理 URL 请求

应用可以通过 URL 的形式唤起其它应用，并将当前的交互托付给能处理这个 URL 的应用。

如果希望处理某个域名的 URL，需要在应用的 package.json 中注册这个 URL，如下是注册一个 foobar.app 域名的例子：

```json
{
  "manifest": {
    "skillIds": ["AVERYLONGSKILLID"],
    "hosts": [
      {
        "name": "foobar.app",
        "skillId": "AVERYLONGSKILLID"
      }
    ]
  }
}
```

> 查看更多应用 Manifest 文档：[应用 Manifest](./04-app-manifest.md#manifesthosts)

在注册了这样一个域名后，其它应用就可以通过如下的调用唤起该应用：

```javascript
activity.openURL('yoda-skill://foobar.app/example')
```

而注册了该域名的应用就可以通过如下代码处理这个 URL 请求：

```javascript
module.exports = function main (activity) {
  activity.on('url', urlObject => {
    activity.tts.speak(`Opened URL ${url.pathname}`)
  })
}
```
