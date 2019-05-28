## 语音焦点概述

语音交互不同于图形交互，相比于 GUI，VUI 在使用中用户更难以同时处理多个交互并行的场景，所以为了更好的用户体验，我们需要协调多个应用的语音交互请求，给用户一个专注的语音交互使用体验。

## AudioFocus

如果把我们的设备当作一个机场，应用们代表了待机的飞机，YodaOS 系统相当于控制塔。我们的应用可以申请期望优先级的语音焦点，但最终的授权决定会由系统发出。我们通过 AudioFocus 模块来和系统的“控制塔”交流。

### AudioFocus 使用场景

#### 媒体应用

媒体应用可以在用户要求播放音乐时，申请默认类型的 AudioFocus，并在申请获得授权后，开始播放媒体。如果该 AudioFocus 被短暂挂起，那么媒体应用需要暂时将媒体暂停，或者可以按照 mayDuck 参数来决定是否可以压低播放器音量。如果该 AudioFocus 被废弃，那么媒体应用需要将媒体播放器停止，此时可以释放播放器资源。当媒体结束播放后，应该主动废弃 AudioFocus。

应用在完成任务后，应该自行退出应用，以缓解设备资源压力。

#### 对话应用

对话应用通常的语音交互比较短暂，所以推荐申请 TRANSIENT 类型的 AudioFocus，并在申请获得授权后，开始语音合成并播放。在 AudioFocus 被挂起后，应该立刻取消当前的语音合成。当语音合成结束播放后，应该主动废弃 AudioFocus。

应用在完成任务后，应该自行退出应用，以缓解设备资源压力。

#### 通话应用

通话应用可以在收到通话请求时，或者用户要求拨打电话时，按需申请默认类型的 AudioFocus 或者 TRANSIENT_EXCLUSIVE 类型的 AudioFocus（取决于应用是否希望在通话时，用户还可以继续要求设备播放其他媒体、唤醒设备）。如果通话应用申请了默认类型的 AudioFocus，我们建议同时申请 VoiceInterface 的 monologue 模式，以防止通话被其他误操作打断。

#### 设备配置应用

设备配置应用应该在开始设备配置状态时，申请 TRANSIENT 类型的 AudioFocus，并在申请获得授权后，准备设备配置环境。如果在设备配置过程中，如果 AudioFocus 被挂起，那么设备配置应用应该将设备配置环境还原，恢复设备正常状态；在完成设备配置后，设备配置应用可以释放该 AudioFocus，以恢复设备状态。

#### 语音激活

在用户语音激活设备时，Launcher 应用会立刻申请 TRANSIENT 类型的 AudioFocus，并且播放设备激活音效，响应用户语音交互。所以在语音激活时，会将当前的 TRANSIENT 类型的 AudioFocus 废弃、短暂挂起当前的默认类型的 AudioFocus。

在应用申请了 TRANSIENT_EXCLUSIVE 类型的 AudioFocus 后，Launcher 应用会关闭设备的唤醒引擎。

## 开始接管系统语音焦点

假设我们的应用代码目录有如下结构：

```
-- ~/awesome-app
   |- package.json
   |
   |- /src
   |  |- /voice
   |  |  |- player.js
   |  |
   |  |- app.js
```

我们希望 app 在接收到 url 事件之后，即启动播放器开始播放媒体，我们为 `~/awesome-app/src/app.js` 撰写以下内容：

```js
var Application = require('@yodaos/application').Application

var app = Application({
  url: (urlObj) => {
    app.startVoice('player', urlObj.query.media_url)
  }
})

app.startVoice = function startVoice (name, args) {
  var voice = require(`./voice/${name}`)
  voice.apply(this, args)
}
```

而在 `~/awesome-app/src/voice/player.js` 中即可关注 VUI 相关的事宜，创建播放器、播放等：
```js
var AudioFocus = require('@yodaos/application').AudioFocus
var MediaPlayer = require('@yoda/multimedia').MediaPlayer

module.exports = function Player (mediaUrl) {
  var focus = new AudioFocus()
  var resumeOnGain = true
  var player = new MediaPlayer()
  player.setDataSource(mediaUrl)
  player.prepare()

  focus.onGain = () => {
    if (resumeOnGain) {
      player.start()
    }
    resumeOnGain = false
  }
  focus.onLoss = (transient, mayDuck) => {
    if (transient) {
      player.pause()
      resumeOnGain = true
    } else {
      player.stop()
    }
  }
  focus.request()
}
```

这样，我们就完成了一个简单的媒体播放应用，

### 运行我们的应用

首先，通过 yoda-cli 将应用代码与测试用例安装到设备：

```bash
~/awesome-app > yoda-cli pm install .
```

安装完成后，我们就可以通过 yoda-cli 给应用发送 Url 指令：
```bash
~/awesome-app > yoda-cli am open-url yoda-app://awesome-app/?media_url=/opt/media/music.mp3
```
