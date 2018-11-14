# YodaOS Book

在语音交互领域，特别是像 Alexa、Homepod 等智能音箱产品的场景下，对于软硬件上的交互形态及设备成本都对于如 Android 或者 Linux 这样的操作系统提出了不同程度的挑战，而 YodaOS 则是作为第一款完全开源的语音交互操作系统应运而生。

YodaOS 具有针对语音场景下的高集成度，它目前集成了：

- Rokid 前端语音唤醒模块（Turen）
- Rokid 云端识别和语义理解 SDK
- Rokid 在线语音合成 SDK
- YodaOS 应用开发框架
- 多媒体播放、音量控制、蓝牙配网和按键处理等

开发者只需要进行简单的配置，即可完成自己定制的智能语音助手。与此同时，我们也同样提供高度定制化、模块化的整体架构，开发者亦可方便地选择想要集成的模块对整个操作系统重新组装。

本书主要面向两类读者：

- 如果你想作为应用开发者，为 YodaOS 开发语音交互应用，那么可以从 [开发者指北][] 开始。
- 如果你想作为智能语音助手定制厂商，那么可以从 [YodaOS Source][] 开始。

### License

Apache.

[开发者指北]: guidance/01-build-your-first-app.html
[YodaOS Source]: yodaos-source/customization/01-overview.html