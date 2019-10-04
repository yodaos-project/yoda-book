# 应用框架

应用框架是应用开发者最常用的功能之一，它向开发者提供了应用的安装与执行，最基础的应用接口，以及针对其他模块框架需要提供给开发者的拓展 API 功能。本章节主要从架构、模块、接口描述语言、应用启动以及服务初始化来进行介绍。

#### 架构

应用框架服务与应用使用了传统的客户端/服务端模型，每个应用在需要时向应用框架服务发出请求，应用框架服务则在一定时间内给出相应。另外客户端也可以向应用框架服务（**AFS** Application Framework Service）申请广播事件，当事件触发后，可以在应用的生命周期内收到广播消息。

<p align="center">
  <img alt="Application Framework" src="../../..//asset/application-framework.svg" height="700" />
</p>

由上图可知，在整个应用框架架构中，应用框架起到了一个桥梁的作用，它用于向 [YodaOS Application][] 提供底层其他框架的 API 能力，为此而分别引入了 [YodaOS Component][] 与 [YodaOS Descriptor][] 的概念，下面会分别介绍。

而对于 [YodaOS Application][] 来说，如何快速且优雅地设计应用 API 也是一项十分重要的工作，为此我们设计了 [Fauna][] 协议，用于定义应用程序生命周期内，与应用框架服务（AFS）的消息体协议，具体可以[该协议文档](https://github.com/yodaos-project/yodart/blob/master/docs/protocol-fauna.md)。

应用框架服务（AFS）仅提供一些非常基础，并且是必须由服务层提供的接口，而其他的接口封装我们都交由应用生态提供，当然，我们也内置一些便捷方法到系统中，比如：

- `@yodaos/mm` 应用单元测试套件
- `@yodaos/application` 应用开发套件
- `@yodaos/speech-synthesis` 语音合成工具类
- `@yodaos/storage` 存储开发套件

> 它们被称为 @yodaos packages，更多详情：https://github.com/yodaos-project/yodart/tree/master/packages/%40yodaos

#### YodaOS Component

YodaOS Component 是应用框架服务（AFS）提供的模块化组件机制，其包含框架层的基础组件：

- `app-loader` 应用加载组件
- `audio-focus` 语音焦点管理
- `broadcast` 应用广播组件
- `chronos` 计时器，可用于提供给提醒类应用
- `dispatcher` 事件分发器
- `keyboard` 按键支持组件
- `media-controller` 多媒体控制组件
- `memory-sentinel` 应用内存管理器

> 更多组件，可以参考这里的[默认组件列表](https://github.com/yodaos-project/yodart/tree/master/runtime/component)。

系统开发者也可以定义自己的组件，在应用框架服务（AFS）中提供了灵活的加载器，方便配置智能设备中的组件列表与加载目录。

定义一个组件也十分简单，只需要在目标机器上指定的[组件搜索目录](https://github.com/yodaos-project/yodart/blob/master/etc/yoda/component-config.json)中新增一个 JavaScript 文件，并按照如下方式暴露一个类即可：

```js
class MyComponent {
  constructor (runtime) {
    this._runtime = runtime
    // do what you want to
  }
}
module.exports = MyComponent
```

YodaOS Component 开发者通过类构造函数的第一个参数访问到 `runtime`，并通过它可以调用到其他组件的方法和事件，以及其他应用框架服务（AFS）的基础功能。

#### YodaOS Descriptor

YodaOS Descriptor 是应用框架服务（AFS）提供的应用接口定义机制，即针对需要向 [YodaOS Application][] 提供 API 接口的 DSL。

与 [YodaOS Component][] 类似，应用框架服务（AFS）会在启动时新建 [YodaOS Descriptor][] 的加载器，不过现在还不提供可配置的入口，所以现在所有的应用接口都需要在 [`runtime/descriptor`](https://github.com/yodaos-project/yodart/tree/master/runtime/descriptor) 定义。

在 [YodaOS][] 中，新增一个 Descriptor 与 [YodaOS Component][] 类似：

```js
// runtime/descriptor/foobar.js
var Descriptor = require('../lib/descriptor')

class MyDescriptor extends Descriptor {
  constructor (runtime) {
    super(runtime, 'foobar')
  }
  hello () {
    return Promise.resolve('hello')
  }
}
MyDescriptor.values = {
  some: {}
}
MyDescriptor.events = {
  created: {}
}
MyDescriptor.methods = {
  hello: {
    returns: 'promise'
  }
}

module.exports = MyDescriptor
```

在如上代码中表述了一个 [YodaOS Descriptor][] 的基本元素：

- 继承自 [Descriptor](https://github.com/yodaos-project/yodart/tree/master/runtime/lib/descriptor.js) 类，它定义在 `runtime/lib/descriptor.js`
- 在类构造函数中，调用 `super(runtime, namespace)` 并设置该接口类的命名空间（namespace）
- 在 `MyDescriptor.values` 定义：使用该类时可访问的值
- 在 `MyDescriptor.events` 定义：使用该类时的事件列表
- 在 `MyDescriptor.methods` 定义：使用该类时的所有方法

到此即完成了应用框架服务端的工作，接下来介绍如何在客户端（应用）访问定义的接口：

```js
class MyApplication {
  constructor () {
    // corresponding to the namespace
    this.api = global[Symbol.for('yoda#foobar')].foobar
    this.api.hello()
  }
}
```

在实际的应用开发中，其实并不需要像上面这样写，在 [`@yodaos/application`](https://github.com/yodaos-project/yodart/tree/master/packages/%40yodaos/application) 包中已经为开发者封装好了更为便捷的使用方式，这里的例子仅作为了解 [YodaOS Descriptor][] 所用。

#### 应用启动

<!-- TODO -->

#### 服务初始化

<!-- TODO -->

[YodaOS Application]: /yodaos-source/02-glossary.md#yodaos-application
[YodaOS Component]: /yodaos-source/02-glossary.md#yodaos-component
[YodaOS Descriptor]: /yodaos-source/02-glossary.md#yodaos-descriptor
[Fauna]: /yodaos-source/02-glossary.md#protocol-fauna
