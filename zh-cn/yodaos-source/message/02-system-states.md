# 系统状态

## YodaOS Event

#### Event `battery.info`

表示电池状态，参数描述如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `data`   | string | 电池信息 |
| `data.batSupported` | bool | 表示是否支持电池 |
| `data.batChargingOnline` | bool | 表示是否在充电 |
| `data.batLevel` | int | 当前电量 |

#### Event `app.setup.network-available `

表示联网状态，参数描述如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `available` | number | 0：网络未连接，1：联网成功 |

#### Event `yodaos.audio.on-volume-change.playback`

音量变化事件，参数如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `volume` | number | 音量值 |

#### Event `yodaos.voice-interface.engine.muted`

声学静麦，参数如下：

| 参数名称  | 类型 | 描述 |
|-----------|-----|------|
| `enabled` | number | 0：声学引擎打开，1：关闭 |

#### Event `yodaos.apps.cloud-player.tts.status`

TTS 播放状态，参数如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `state`  | number | 0：播放开始，1：播放结束，2：被取消，3：播放失败 |

#### Event `yodaos.apps.cloud-player.multimedia.playback-status`

多媒体播放器的播放状态，参数如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `state`  | number | 0：播放开始，1：播放结束，2：被取消，3：播放失败，4：暂停，5：恢复 |
| `id`     | string | 资源 ID |

#### Event `yodaos.apps.bluetooth.multimedia.playback-status`

蓝牙播放器的播放状态，参数如下：

| 参数名称  | 类型 | 描述 |
|----------|-----|------|
| `state`  | number | 0：播放开始，1：播放结束，2：被取消，3：播放失败，4：暂停，5：恢复 |

[Voice Interface Driver]: /yodaos-source/glossary.md#voice-interface-driver