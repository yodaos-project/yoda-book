# YODAOS mqtt自定义消息处理指引

## 概述

除了使用设备自身进行交互之外，YODAOS 还支持远程消息交互。例如最常见的是通过手机发送指令给设备执行，其中手机发送的指令就是通过 mqtt 传输到设备。
系统内置了一些常用的指令，比如手机发送文字指令、手机端点播指令。有时候用户想[通过手机SDK][mobile-sdk]发送自定义的消息给设备，然后在设备端处理它。通过 wormhole 模块允许用户扩展自定义的消息并处理它。

## wormhole 模块

[通过手机SDK][mobile-sdk]发送的消息需要符合一定的格式，格式如下：

```json
{
  "topic": "String",
  "text": "String"
}
```

扩展 wormhole 模块是通过产品定制化。设备端收到的 mqtt 消息都会通过 wormhole 模块进行分发。当收到一个 mqtt 消息时，先判断产品定制化配置中有没有注册此 topic，如果有，则将此消息分发给产品定制化模块。如果没有，则将此消息分发给系统内置的监听者。如果都没有注册者，则忽略此消息。下面介绍定制方式。

## 通过产品定制化处理自定义消息

此方式使用 json 文件配置，文件名为 `wormhole.json`。配置文件格式如下：

```json
{
  "handlers": {
    "app-with-args": {
      "url": "yoda-skill://foobar"
    },
    "naive-topic": {
      "bin": "/usr/bin/bash",
      "args": [
        "/etc/a-script"
      ],
      "withContent": true,
      "timeout": 30000
    },
    "runtime-method": {
      "runtimeMethod": "appGC",
      "params": [
        "appId"
      ]
    }
  }
}
```

key 为消息中的 topic。handler 类型有 3 种:

  1. url: 执行一个 URL
  2. bin: 执行一个 shell 命令
  3. runtimeMethod: 执行 runtime 中的函数并将 text 作为最后的 argument

不同的类型通过相应的字段区分，并且一个 topic 只支持一种类型，优先级按照上面的顺序。

其中，如果通过 url 打开 app，会在这个 url 的 query 中加入 __topic 与 __text 字段，分别为 wormhole 的 topic 与 text

新增 handler 为 bin 类型时, 是否将 mqtt 消息内容作为参数传入的 boolean 标记是 withContent


[mobile-sdk]: https://rokid.github.io/mobile-sdk-android-docs/res/86_topic_msg.html