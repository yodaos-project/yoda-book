# 语音交互接口

## YodaOS Event

#### Event `rokid.turen.start_voice`

表示语音请求开始，参数描述如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `trigger`  | int | 唤醒词 |
| `triggerStart` | int | 唤醒词在语音流的开始偏移量 |
| `triggerLength` | int | 唤醒词语音流长度（按采样点计算）|
| `soundIntensity` | float | 音强 |
| `enableCloudVerification` | int | 是否开启云端激活词确认 |
| `extra` | string | 拓展字段 |

#### Event `rokid.turen.voice`

表示收到声学模块的语音数据，参数如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `voice`  | binary | 音频数据 |
| `id`     | int    | 音频请求ID |


## YodaOS Method

#### `yodaos.voice-interface.tts.speak(dataChannel, utterance)`

- **调用**该接口可以发起语音合成请求
- **实现**该接口可实现连接自定义的语音合成服务

参数如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `dataChannel` | string | 合成后的语音数据将通过此 channel 广播发送 |
| `utterance` | string | 需要合成语音的文本，如：“你好” |

返回数字，具体含义如下：

| 返回值 | 代表含义 |
|-------|---------|
| 0     | 成功，仅表示 [Voice Interface Driver][] 成功接收请求 |
| 1     | 参数错误 |
| 2     | [Voice Interface Driver][] 请求队列过长 |

调用者通过 `dataChannel` 会传递一个广播名给 [Voice Interface Driver][]，
后者收到后会在获取到语音数据后，通过这个名称广播出来，具体消息格式如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `state`  | int | 0表示语音数据，1表示语音结束，-1表示云端请求超时，-2表示其他错误 |
| `data`   | binary | 语音数据（可选）|

#### `yodaos.voice-interface.nlp(asr)`

- **调用**该接口可以发起 NLP 请求
- **实现**该接口可实现连接自定义的 NLP 服务

参数如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `asr`    | string | 输入的语音 |

返回数字，具体含义如下：

| 返回值 | 代表含义 |
|-------|---------|
| 0     | 成功，仅表示 [Voice Interface Driver][] 成功接收请求 |

[Voice Interface Driver]: /yodaos-source/glossary.md#voice-interface-driver