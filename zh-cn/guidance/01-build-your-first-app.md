## YodaOS 开发者工具

[YodaOS 开发者工具](https://github.com/yodaos-project/yoda-platform-tools) 提供了一系列的便捷工具来对 YodaOS 设备进行操作，启动应用，安装应用，查看应用日志等。

可以从 [YodaOS 开发者工具 Releases](https://github.com/yodaos-project/yoda-platform-tools/releases) 页面下载 YodaOS 开发者工具。

## 创建 YodaOS 应用项目

通过 YodaOS 开发者工具，我们可以快速地创建一个 YodaOS 应用项目：

```bash
~/workspace > yoda-cli init app awesome-demo-app
✔ Name of the package … awesome-demo-app
✔ A short description of the package … A demo application project
✔ Is this package private? … no / yes
✔ Keywords … demo,app
```

运行了以上命令后，就可以在当前目录下的 `awesome-demo-app` 目录中看到生成的 YodaOS 应用项目了。

更多的 `yoda-cli` 命令可以通过 `yoda-cli help` 查看。

生成项目之后，即可将应用安装到 YodaOS 设备上：

```bash
~/workspace > yoda-cli pm install awesome-demo-app

--- OR ---

~/workspace/awesome-demo-app > yoda-cli pm install .
```

## 程序入口：YodaOS Application

对于 YodaOS 来说，每个应用都是一个 [CommonJS](https://nodejs.org/docs/latest/api/modules.html) 模块。YodaOS 的应用的主入口即为通过 `require('@yodaos/application').Application` 创建的 Application 实例。

```javascript
var Application = require('@yodaos/application').Application
var app = Application({})
```

应用通过这个 `Application` 对象来与系统交互，接收系统、应用事件等。

### 接收系统事件

在创建 `Application` 的时候，`Application` 接收一个字面对象，这个对象上可以挂载多个事件的监听函数，通过这些监听函数我们可以监听应用与系统的事件：

```javascript
var Application = require('@yodaos/application').Application
var logger = require('logger')('app')

var app = Application({
  url: function url (urlObj) {
    logger.info(`Received url: ${urlObj.href}`)
  },
  broadcast: function broadcast (event) {
    logger.info(`Received broadcast: ${event}`)
  }
})
```

## 应用 Manifest

除了程序代码，应用还需要向声明自己的身份、权限请求等信息，以便 YodaOS 向应用分配资源等。YodaOS 应用的 package.json 就包含了这些信息：

```json
{
  "name": "com.company.example.awesome-app",
  "version": "1.0.0",
  "main": "app.js",
  "manifest": {
    "services": [
      [ "a-service", { "main": "a.js" } ],
      "b-service"
    ],
    "hosts": [
      "awesome-app"
    ]
  }
}
```

package.json 类似于 [npm](https://www.npmjs.com/) 包，但是对于 YodaOS 应用来说，其中最重要的字段莫过于 name 与 manifest：前者声明了应用的本地 ID，后者声明了需要向系统申请的资源等信息。

> 查看更多 package.json 描述文档：[应用 Manifest](./04-app-manifest.md)

## 处理 URL 请求

应用可以通过 URL 的形式唤起其它应用，并将当前的交互托付给能处理这个 URL 的应用。

如果希望处理某个域名的 URL，需要在应用的 package.json 中注册这个 URL，如下是注册一个 foobar.app 域名的例子：

```json
{
  "name": "com.example.app.foobar",
  "manifest": {
    "hosts": [
      "foobar.app"
    ]
  }
}
```

> 查看更多应用 Manifest 文档：[应用 Manifest](./04-app-manifest.md#manifesthosts)

而注册了该域名的应用就可以通过如下代码处理如 `yoda-app://foobar.app/data/media/music.mp3` 的 URL 请求：

```javascript
var Application = require('@yodaos/application').Application
var AudioFocus = require('@yodaos/application').AudioFocus
var MediaPlayer = require('@yoda/multimedia').MediaPlayer
var logger = require('logger')('app')
var path = require('path')

var app = Application({
  url: function url (urlObj) {
    logger.info('Received url: ', urlObj.href)
    var focus = new AudioFocus()
    var resumeOnGain = false
    var player
    focus.onGain = () => {
      resumeOnGain = false
      if (player == null) {
        player = new MediaPlayer()
      }
      if (resumeOnGain) {
        player.resume()
      } else {
        player.start(this.privateTransformPath(urlObj.pathname))
      }
    }
    focus.onLoss = (transient) => {
      if (transient) {
        player.pause()
        resumeOnGain = true
      } else {
        player.stop()
      }
    }
    focus.request()
  }
})

app.privateTransformPath = function (mediaPath) {
  /** a very private method should not be used by others */
  return path.join('/a-private-path', mediaPath)
}
```

> 查看更多 URL Object 的文档：[Legacy urlObject](https://nodejs.org/docs/latest/api/url.html#url_legacy_urlobject)
