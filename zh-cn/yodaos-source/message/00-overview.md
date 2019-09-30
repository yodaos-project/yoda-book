# 系统消息

YodaOS 中通过 [YodaOS Message][] 完成对系统中的某个模块的定制化，本章节即是列出 YodaOS 中标准的消息接口，方便有需要的开发者对模块进行定制。

[YodaOS Message][] 使用 [yodaos-project/flora][] 作为 IPC 方式，它支持的数据结构包括：

- `int`
- `float`
- `long`
- `double`
- `string`
- `binary`

> 本章节描述中出现的`number`格式为`int`或`double`。

本章节主要介绍：

- 定义[语音交互接口](./01-voice-interface.md)
- 定义[系统状态](./02-system-states.md)

[YodaOS Message]: /yodaos-source/02-glossary.md#yodaos-message
[yodaos-project/flora]: https://github.com/yodaos-project/flora
