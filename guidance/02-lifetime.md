## 概述

在了解了[若琪的技能](https://developer.rokid.com/docs/2-RokidDocument/1-SkillsKit/platform-introduction.html)之后，如果需要开发与设备强相关的技能，则需要开发一个本地应用。复杂的应用代码需要和系统框架不断地交流、互动。系统框架会提供一些所有应用运行必需的基础设施，而应用开发者提供客制化这些基础设施的代码，让应用按照开发者所想的方式运行。如果想要更加效率地客制化一个应用，了解一些关于 YodaOS 基础设施是如何工作的会提供一些帮助。

## 应用状态

应用分为 4 个状态

| 状态名 | 主要作用 | 备注 |
| --- | --- | --- |
| Not Running | - | - |
| Inactive | 没有任务正在运行的状态 | 代表应用不在工作，资源优先被系统回收 |
| Active | 当前栈顶应用，可能是被 NLP、URL 激活，或者是从 background 状态应用主动激活 | 只有这个状态可以播报 TTS，播放媒体等 |
| Paused | 只可能是以 scene 形式激活的应用，曾经为激活状态，但是被别的以 cut 形式应用暂时压入了暂停状态 | 在进入 pause 状态时应该将应用自己的媒体暂停 |
| Background | 进入后台运行，与 inactive 有区别的是当前还有正在运行的任务，不应用被系统回收资源 | 需要应用主动进入该状态 |

![YodaOS 应用生命周期](../asset/YodaOS-App-Life-Cycle.jpg)


### 应用进程与应用生命周期
daemon 应用会在 vui 准备好时（如登陆成功），由 vui 负责启动，并设置为 inactive 状态，同时应用会收到 activity#create 事件。在收到 nlp/url 时，如果不在栈顶，会先收到 activity#active 事件，再收到 activity#request/activity#url 事件。
如果 daemon 应用在收到 nlp/url 时进程已经崩溃还未重启，会和普通应用一样在当时启动。

普通应用会在收到 nlp/url 时，如果还没有进程还没有被创建，会由 vui 负责启动，并收到 activity#create 事件，如果应用还不在栈顶，会再收到 activity#active 事件，最后收到 activity#request/activity#url 事件。

应用处理完所有请求（nlp/url）后，应该主动退出，腾出栈顶，以便被暂停的应用如音乐等继续播放媒体。应用可以通过 Activity#exit 主动退出，或者通过 Activity#setBackground 将自己置入后台状态。在当前栈顶应用主动腾出栈顶后，vui 会尝试恢复之前被暂停的应用，并通过 activity#resume 事件告知应用已经被恢复到栈顶。

如果一个以 scene 表现形式的应用在活跃状态时，用户触发了一个语音命令希望打开另一个应用，则

在应用调用了 Activity#exit 后，应用会被标记被 inactive，并收到 activity#destroy 事件。在 inactive 状态的应用会在适当的时间被 vui 回收系统资源。当前普通应用会在收到 activity#destroy 事件后被系统回收进程资源。

### 后台运行
应用（包括 daemon 应用和普通应用）都可以主动将自己置入后台，腾出栈顶，以便被暂停的应用如音乐等继续播放媒体。应用可以使用 Activity#setBackground 方法将自己置入后台。值得注意的是，应用不在栈顶的话是没有权限播报 tts/播放媒体的，所以如果在后台任务执行到一定程度需要播报一个 tts/播放媒体时，需要使用 Activity#setForeground 抢占激活状态。


## 生命周期事件

每次应用的生命周期状态变化时，应用都可以通过 Activity 实例收到状态变化的事件。

- `activity#create` 事件：会在应用进程准备完毕后触发，可以开始应用的初始化工作；
- `activity#active` 事件：会在应用进入激活状态后触发，可以开始 tts/媒体等语音交互；
- `activity#pause` 事件：会在表现形式为 scene 的应用短时被别的表现形式为 cut 的应用抢占激活状态时触发；
- `activity#destroy` 事件：会在应用退出活跃状态时触发；
- `activity#request` 事件：会在收到应用的 NLP 请求时触发；
- `activity#url` 事件：会在其它应用调用 openURL 后对注册了对应 url 的应用触发；

## 处理应用状态变化的策略

### 应用启动的时候应该什么

当应用启动后，通过监听 `activity#create` 事件来完成以下的事情：

- 初始化应用的重要数据
- 准备好应用的 VUI，如应答用户问询的回复、准备媒体播放器等

`需要注意的是，activity#create` 的事件监听应该尽可能的轻量，应用应该在 5s 内就能处理完所有的初始化工作，并且能够处理用户的交互事件。如果应用没有在 5s 内就处理完所有初始化工作，系统框架会以无响应的理由 kill 应用进程。

### 应用收到 `activity#pause` 时应该做什么

应用在运行时，用户可能会临时要求系统响应某些命令，这时，系统框架会临时暂停当前的应用，并启动另一个应用来处理当前的用户命令。而被临时暂停的应用需要通过监听 `activity#pause` 事件来完成以下的事情：

- 保存当前的媒体进度
- 保存当前的应用状态

直到应用收到监听的 `activity#resume` 事件之前，应用应该随时准备因临时处理命令的应用的退出而触发的应用恢复事件，并完成以上暂停的操作的恢复。

### 应用主动进入后台后应该做什么

语音应用不需要时时保持在前台活跃，部分应用如系统蓝牙在没有连接上蓝牙设备时，可以暂时停留在后台等待连接，并将前台留给其它活跃应用。

### 应用收到 `activity#destroy` 应该做什么

应用在处理完所有命令之后，通过主动调用 `Activity#exit` 来退出当前活跃状态；或者因为一个新的用户命令，其他应用需要进入活跃状态而将当前应用强行退出活跃状态时，当前应用都会被挂起，并会监听到 `activity#destroy` 事件。在这个监听中，应用应该以最快的速度完成以下操作：

- 保存应用状态
- 停止所有计时器或周期性任务
- 不要发起新的任务请求

## Daemon 应用

部分应用可能会希望在 VUI 准备好时，尽快启动，以便初始化一些需要保持长时间活跃的操作；或者如 IoT 应用需要在设备启动完成后，开始局域网内的设备发现、注册、保持设备间的连接等，类似的应用会需要在执行完如 NLP 请求后继续保持活跃，这些情况下，应用需要在 Manifest 中注册为 daemon 应用。

> 查看更多 package.json 描述文档：[应用 Manifest](./04-app-manifest.md)

## 如何调试生命周期

应用在在收到 vui 的消息事件的时候，会自动打印如下的类似日志：
```
<@ipc> Received VuiDaemon event event:resume
```

应用在调用 Activity 的 API 时，会自动打印如下日志：
```
<bus-4321> Received child @yoda/cloudappclient invocation(10): Activity.tts.stop
<@ipc-4321> Received VuiDaemon resolved promise(10)
```
其中会有应用进程 pid，应用 id，调用序列号，与 API 名字，并在调用完成后打印对应序列号的调用是否返回。

如果需要查询当前激活的应用，可以使用 `tools/yoda-debug GetLifetime`，可以获取到如当前应用、当前应用类型、当前正在运行的应用等信息：
```json
{
  "activeSlots": {
    "cut": null,
    "scene": "@yoda\/cloudappclient"
  },
  "appDataMap": {
    "@yoda\/cloudappclient": {
      "form": "scene"
    }
  },
  "backgroundAppIds": [],
  "monopolist": null,
  "appIdOnPause": null,
  "cloudAppStack": {
    "cut": "7D0F5E5D57CD496B940654D7C8963AE0",
    "scene": "RBA66C902A6347DD86CA8D419B0BB974",
    "active": "RBA66C902A6347DD86CA8D419B0BB974"
  },
  "appStatus": {
    "@yoda\/network": "exited",
    "@yoda\/cloudappclient": "running",
    "@yoda\/system": "running",
    "@yoda\/volume": "running"
  }
}
```

<!--
## 应用开发常见问题

### tts/multimedia 需要应用为当前激活应用
前一个 NLP 还未处理完时，下一个 NLP 已经进入，而如果前一个 NLP 包含一个 tts，通常写法如下面这个场景，容易造成下一个 NLP 无法播报：

```javascript
module.exports = activity => {
  activity.on('request', nlp => {
    activity.tts.speak('泥猴')
      .then(() => activity.exit())
  })
})
```
-->
