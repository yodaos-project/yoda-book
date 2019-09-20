# voice-interface flora消息定义

```
此文档列出voice-interface订阅的flora消息和可调用的flora函数
flora消息以caps为序列化工具，数据类型支持int,float,long,double,string,binary
下面描述中出现的number格式为int或double类型

要调用voice-interface定义的flora函数，需要指定flora name: voice-interface
example:
floraAgent.call(methName, params, "voice-interface", timeout);
```

## 目录

* [状态上报](#H1)
    * [订阅消息](#H1.1)
        * [电池状态](#H1.1.1)
        * [TTS播放状态](#H1.1.2)
        * [音量变化](#H1.1.3)
        * [配网状态](#H1.1.5)
        * [前端静音](#H1.1.6)
        * [媒体播放状态](#H1.1.7)
        * [蓝牙媒体播放状态](#H1.1.8)
* [语音交互](#H2)
    * [订阅消息](#H2.1)
        * [语音请求开始](#H2.1.1)
        * [语音请求中](#H2.1.2)
    * [可调用函数](#H2.2)
        * [文本转语音](#H2.2.1)
        * [文本转语音通道消息格式](#H2.2.2)
        * [语义理解asr2nlp](#H2.2.3)

## <a id="H1"></a>状态上报

### <a id="H1.1"></a>订阅消息

#### <a id="H1.1.1"></a>电池状态

|名称|battery.info||
|---|---|---|
|参数|||
|string||json格式|
|||bool batSupported|
|||bool batChargingOnline|
|||int batLevel|


#### <a id="H1.1.2"></a>TTS播放状态

|名称|yodaos.apps.cloud-player.tts.status||
|---|---|---|
|参数|number|0: tts播放开始|
|||1: tts播放结束|
|||2: tts播放取消(目前不支持tts取消: 忽略)|
|||3: tts播放失败|

#### <a id="H1.1.3"></a>音量变化

|名称|yodaos.audio.on-volume-change.playback||
|---|---|---|
|参数|number|音量值0~100|

#### <a id="H1.1.5"></a>配网状态

|名称|app.setup.network-available||
|---|---|---|
|参数|number|0: 网络未准备好|
|||1: 配网成功，wifi已连接|

```
当配网成功时，vbs-proc才会尝试连接语音服务器
当网络状态变为未准备好时，vbs-proc断开与云端的连接，并不会重连
```

#### <a id="H1.1.6"></a>前端静音

|名称|yodaos.voice-interface.engine.muted||
|---|---|---|
|参数|number|0: 麦克风打开|
|||1: 麦克风关闭|

#### <a id="H1.1.7"></a>媒体播放状态

|名称|yodaos.apps.cloud-player.multimedia.playback-status||
|---|---|---|
|参数|number|0: 播放开始|
|||1: 播放结束|
|||2: 取消|
|||3: 错误|
|||4: 暂停|
|||5: 恢复|
||string|mediaId|

#### <a id="H1.1.8"></a>蓝牙媒体播放状态

|名称|yodaos.apps.bluetooth.multimedia.playback-status||
|---|---|---|
|参数|number|0: 播放开始|
|||1: 播放结束|
|||2: 取消|
|||3: 错误|
|||4: 暂停|
|||5: 恢复|

## <a id="H2"></a>语音交互

### <a id="H2.1"></a>订阅消息

#### <a id="H2.1.1"></a>语音请求开始

|名称|rokid.turen.start\_voice||
|---|---|---|
|参数|string|激活词|
||int|激活词在语音流的开始偏移量|
||int|激活词语音流长度(按采样点计算)|
||float|音强|
||int|云端二次确认开关|
||string|extra(忽略)|

#### <a id="H2.1.2"></a>语音请求中

|名称|rokid.turen.voice||
|---|---|---|
|参数|binary|语音数据|
||int|前端语音请求id|

### <a id="H2.2"></a>可调用函数

#### <a id="H2.2.1"></a>文本转语音

|名称|yodaos.voice-interface.tts.speak||
|---|---|---|
|参数|string|flora消息通道channel|
|||语音数据将通过此flora channel广播发送|
||string|语音文本|
|返回||0: 成功, 仅表示vbs-proc成功接受了此指令|
|||1: 参数错误|
|||2: vbs-proc繁忙(tts请求队列过长)|


#### <a id="H2.2.2"></a>文本转语音通道消息格式

|名称|文本转语音消息参数传入的通道名||
|---|---|---|
|参数|int|0: 语音数据|
|||1: 语音结束|
|||-1: 云端请求超时|
|||-2: 其它错误|
||binary|语音数据|
|||可选项，当第一个参数为0时才有语音数据|

#### <a id="H2.2.3"></a>语义理解asr2nlp

|名称|yodaos.voice-interface.nlp||
|---|---|---|
|参数|string|asr|
|返回||0 总是成功, 仅表示vbs-proc成功接受了此指令|
