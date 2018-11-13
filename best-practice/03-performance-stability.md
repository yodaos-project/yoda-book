## 概览

首先我们了解一下 YodaOS 的运行时：YodaOS 基于 [ShadowNode][] 它采用事件驱动、非阻塞I/O模型；在设计之初，[ShadowNode][] 的接口与 [Node.js][]兼容，因此在大部分场景下，开发者可以像 [Node.js][] 一样使用 [ShadowNode][]，了解这些有利于开发者更快速的进行 YodaOS 上的应用开发。

YodaOS 开发应用时，需要关注应用的性能与稳定性，包括但不限于以下：

- 快速启动
- 快速响应语音交互
- 不出现异常与崩溃

## 启动

当一个应用被启动后， YodaOS 希望应用在5秒内完成启动的相关逻辑，如果5秒内没有完成启动应用将会被退出(kill) 。好的应用应该尽可能快的完成启动，以便更快的为用户提供服务。如果应用内部初始化逻辑包含 I/O 等阻塞操作，这些操作不应该阻塞启动过程，开发者可以维护一个内部的状态机来管理应用的初始化状态。

## 进程和线程

YodaOS 会为每个应用创建一个单独的进程，应用的代码将会 [JerryScript][] 线程执行（主线程），当然开发者也可以在	此之后为应用创建单独的进程或者线程来执行某些工作。

应用的主线程主要负责接收并处理系统事件（NLP、按键等），因此主线程一般也叫做 UI 线程。由于主线程本身的特殊性，如果应用中包含I/O等阻塞操作将会导致应用无法及时响应系统的事件，这样会导致用户体验变得很差；同时 [ShadowNode][] 不是线程安全的编程模型，因此不要在其它线程中操作 [ShadowNode][] 及其相关的API。

在如之前所说，[ShadowNode][] 采用事件驱动、非阻塞 I/O 模型，这种模型是通过 [libtuv][] 实现，如果应用逻辑中包含 I/O 或者其它阻塞任务，开发者可以将任务放到 [libtuv][] 的线程池中执行，执行完毕后会在主线程中回调，无需自己来处理线程同步等逻辑，示例请参考[官方实现](https://github.com/libuv/libuv/blob/e4087dedf837f415056a45a838f639a3d9dc3ced/docs/code/queue-work/main.c)。

需要指出的是，在 YodaOS 中如非必要，建议统一使用 [libtuv][] 的[线程池](http://docs.libuv.org/en/v1.x/threadpool.html)来处理多线程逻辑。使用 [N-API][] 和 [libtuv][] 进行多线程处理。

[JerryScript][] 是通过C编写的脚本语言，如果应用中包含大量密集计算的逻辑，建议把这些逻辑通过 [N-API][] 的方式放到 C/C++ 中执行，这样可以加快处理速度。

## ANRs

当应用的主线程由于某些原因被长时间阻塞时，应用将会出现 __Application Not Responding__（[ANRs][]）。这个过程对应用来说是透明的， YodaOS 使用下面的规则来判断和处理 [ANRs][]：

- 应用底层将会每5秒会发送一个心跳给 YodaOS（无需开发者处理）
- 当 YodaOS 连续3次（15秒）没有收到来自应用的心跳时，YodaOS 将会重启应用

处于 ANR 的应用将无法接收和处理用户的输入，这对于用户体验来说是非常糟糕的，所以应用应该避免这种情况的出现，下面列举了常见的可能导致ANR出现的情况：

- 在主线程做同步 I/O
- 在主线程做长时间的大量的密集计算
- 主线程同步的等待其它线程的处理结果，而其它线程没有及时处理完成，比如`thread.join()`或条件变量等
- 主线程和其它线程形成死锁

下面列举了常用的解决方式：

- 对于大量密集计算的情况，可以通过系统提供的`simpleperf`等工具查看一段时间内应用函数调用情况（需要未strip的库）；如果 CPU 大部分消耗在虚拟机内，则可以通过 [ShadowNode][] 提供的[CPU Profiler](https://github.com/Rokid/ShadowNode/blob/bc244fe51236ddc70a3fae85a888594d99fd8e7f/docs/devs/Optimization-Tips.md#cpu-profiler)生成[火焰图](http://www.brendangregg.com/flamegraphs.html)来查看脚本函数调用情况
- 对于同步 I/O 、多线程同步或死锁等情况，可以通过 [strace](https://linux.die.net/man/1/strace) 查看系统调用情况，追踪等待前的最后一次调用或完成后的第一次调用来确定原因

总之，不要让主线程处于等待或者满载状态

## 内存管理

无论在什么样的环境中开发应用，内存管理都是时刻需要关注的点。 YodaOS 应用的内存由 [JerryScript][] 虚拟机管理，虚拟机通过引用计数、标记清除算法来执行垃圾回收，在虚拟机的堆内存小于一定值的时候会自动的触发 回收机制，来保证内存可用。但是这并不意味着开发者不需要去关注应用的内存使用情况，以下是两种常见的内存泄露场景：

- 对象被全局或闭包变量引用导致无法释放

  ```js
  var obj = {}
  setInterval(() => {
    var timestamp = Date.now()
    obj[timestamp] = true
  }, 1000)
  ```

- 使用 [N-API][] 创建或获取对象后没有释放

  ```c
  napi_value functionExportToJS(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value argv[argc];
    napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
    napi_value value = argv[0];
    napi_ref ref = NULL;
    napi_create_reference(env, value, 1, ref);
    // balabalabala...
    // napi_delete_reference(env, ref);
    return NULL;   
  }
  ```

- 多线程回调时没有开启 [Handle Scope](https://nodejs.org/docs/latest/api/n-api.html#n_api_napi_open_handle_scope)

  ```c
  void handleAsyncCallbackFromOtherThread(uv_async_t* handle) {
    // napi_handle_scope scope;
    // napi_open_handle_scope(env, &scope);
    // balabalabala...
    napi_create_string_utf8(...);
    // napi_close_handle_scope(env, scope);
  }
  ```

所以无论是自带自动回收，或是需要自己管理内存的语言，在逻辑处理完后，对象都应该及时释放或解除引用，避免出现内存泄露。开发者可以通过`process.memoryUsage()`来获取进程的常驻内存大小`rss`、虚拟机的内存池大小`heapTotal`以及虚拟机内存池的使用大小`heapUsed`。

当进程出现内存泄露时，可以定时打印`heapUsed`，如果`heapUsed`持续上涨代表是脚本内存泄露，这个时候可以通过 [ShadowNode][] 提供的 [Heap Profiler](https://github.com/Rokid/ShadowNode/blob/bc244fe51236ddc70a3fae85a888594d99fd8e7f/docs/devs/Optimization-Tips.md#heap-profiler) 来生成多次虚拟机内存的snapshot，通过比较进程快照(Snapshot)来确定是哪些对象泄露。

## 异常处理

脚本出现异常时导致进程退出时，开发者可以通过查看日志中的调用栈来定位原因：

```sh
TypeError: Expected a function.
    at main (/data/test.js:5:10)
    at anonymous (/data/test.js)
```

当脚本出现未捕获的异常（uncaughtException）时，[ShadowNode][] 会将这个异常抛到全局对象`process`对象中，如果未监听`process`对象的异常，[ShadowNode][] 将会强制退出应用。正常情况下开发者应该避免出现未捕获的异常的情况出现，除了常见的没有去处理错误导致未捕获的异常出现外，还有下面的情况也会导致：

```js
try {
  setTimeout(function throwAnError () {
    console.log('Hello Yoda')
    throw new Error('intentionally throw an error')
  }, 1000)
} catch (err) {
  console.log('catched an intentional error')
}
```

事实上这个错误并不能被捕获，因为`setTimeout`是一个异步调用，1秒后`throwAnError`被调用时调用栈已经不是声明时的了，`try/catch`无法捕获到这个错误，因此也导致 [ShadowNode][] 将会强制退出当前进程。可以通过下面的方式来避免进程被强制退出：

```js
process.on('uncaughtException', function (err) {
  // balabala...
})
```

但是这通常不是一种好的做法，因为出现未捕获异常时代表这个错误不是开发者预期的，而这个异常后的开发者预期会执行的代码不会被执行，比如下面的例子，虽然没有导致进程退出，但是会导致内存泄露：

```js
process.on('uncaughtException', function (err) {
  console.log('handled function exception.')
})
var funcs = {}
function main (funcName, func) {
  funcs[funcName] = func
  funcs[funcName]()
  delete funcs[funcName]
}
main('func1', 'this is a string, not a function')
```

上面的例子中，由于`func`的值并不是一个`function`而是`string`，导致在第七行执行的时候会出现错误，虽然在第一行捕获到了这个错来避免进程的退出，但是第八行的代码无法执行导致`funcs`上`func`的引用无法解除进而导致`func`引用的泄露。所以在`process`对象上出现未捕获的错误时，更多常见的做法是友好的提示错误（如果有必要）和完成清理工作后主动退出进程。

## 性能提示

- 常见的方法：
  - 缓存：将数据、计算结果等与上下文无关的缓存起来，加快处理速度
  - 延迟：将不必要的逻辑延迟处理，不阻塞当前交互流程，比如统计、埋点等逻辑
  - 批处理：当一次交互包含多个相同类型的处理时，将它们一次性处理完，比如批量 I/O
- 不要依赖太多的外部库，很多库的实现从通用性的考虑会有一些额外的消耗
- 做好弱网下的测试，很多问题可能只会在弱网的时候暴露出来
- 当出现性能瓶颈时，优化业务流程带来的收益往往是最大的
- 最重要的一点，在开发过程中保持对性能和稳定性的关注，不要在开发完成后再回头处理问题

[ShadowNode]: https://github.com/Rokid/ShadowNode
[JerryScript]: https://github.com/Rokid/ShadowNode/tree/master/deps/jerry
[libtuv]: https://github.com/Rokid/ShadowNode/tree/master/deps/libtuv
[N-API]: https://nodejs.org/docs/latest/api/n-api.html
[ANRs]: https://developer.android.com/topic/performance/vitals/anr
