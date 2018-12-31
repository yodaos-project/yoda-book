## Overview

First let's take a look at the runtime of YODAOS: YODAOS is based on [ShadowNode][] which uses an event-driven, non-blocking I/O model; at the beginning of the design, the [ShadowNode][] interface is compatible with [Node.js][], So in most scenarios, developers can use [ShadowNode][] like [Node.js][] to understand that these will help developers to develop applications on YODAOS more quickly.

When developing applications, YODAOS needs to pay attention to the performance and stability of the application, including but not limited to the following:

- Quick Start
- Quick response to voice interaction
- No exceptions and crashes

## start up

When an application is launched, YODAOS wants the application to complete the startup logic within 5 seconds. If the application is not completed within 5 seconds, it will be killed. Good applications should be launched as quickly as possible to serve users faster. If the application's internal initialization logic includes blocking operations such as I/O, these operations should not block the startup process, and developers can maintain an internal state machine to manage the application's initialization state.

## Processes and threads

YODAOS will create a separate process for each application, and the application code will be executed by the [JerryScript][] thread (the main thread). Of course, the developer can also create a separate process or thread for the application to perform some work. .

The main thread of the application is mainly responsible for receiving and processing system events (NLP, buttons, etc.), so the main thread is also generally called the UI thread. Due to the particularity of the main thread itself, if the application includes blocking operations such as I/O, the application will not be able to respond to system events in time, which will result in poor user experience; while [ShadowNode][] is not thread-safe programming. Model, so don't manipulate [ShadowNode][] and its related APIs in other threads.

As mentioned earlier, [ShadowNode][] uses an event-driven, non-blocking I/O model. This model is implemented via [libtuv][]. If the application logic contains I/O or other blocking tasks, the developer can Put the task into the thread pool of [libtuv][]. After the execution, it will call back in the main thread. You don't need to handle the logic such as thread synchronization yourself. For examples, please refer to [Official Implementation](https://github.com/ Libuv/libuv/blob/e4087dedf837f415056a45a838f639a3d9dc3ced/docs/code/queue-work/main.c).

It should be noted that if it is not necessary in YODAOS, it is recommended to use [threadpool] of [libtuv][](http://docs.libuv.org/en/v1.x/threadpool.html) to handle multithreading. logic. Use [N-API][] and [libtuv][] for multithreading.

[JerryScript][] is a scripting language written in C. If the application contains a lot of intensive computing logic, it is recommended to put these logics into C/C by [N-API][], which speeds up processing. .

## ANRs

When the application's main thread is blocked for a long time for some reason, the application will appear __Application Not Responding__([ANRs][]). This process is transparent to the application, and YODAOS uses the following rules to determine and process [ANRs][]:

- The bottom layer of the app will send a heartbeat to YODAOS every 5 seconds (no developer processing required)
- YODAOS will restart the app when YODAOS does not receive a heartbeat from the app 3 times (15 seconds)

Applications that are in ANR will not be able to receive and process user input, which is very bad for the user experience, so applications should avoid this situation. Here are some common scenarios that can lead to ANR:

- Synchronize I/O on the main thread
- Do a lot of intensive calculations on the main thread for a long time
- The main thread synchronizes waiting for the processing results of other threads, while other threads do not process them in time, such as `thread.join()` or condition variables.
- The main thread and other threads form a deadlock

The common solutions are listed below:

- For a large number of intensive calculations, you can use the tools provided by the system such as `simpleperf` to view the application function call for a period of time (requires unstriped libraries); if the CPU is mostly consumed in the virtual machine, you can pass [ShadowNode] [] Provided [CPU Profiler](https://github.com/Rokid/ShadowNode/blob/bc244fe51236ddc70a3fae85a888594d99fd8e7f/docs/devs/Optimization-Tips.md#cpu-profiler) to generate [flame map](http://www .brendangregg.com/flamegraphs.html) to view script function calls
- For synchronous I/O, multi-threaded synchronization or deadlock, etc., you can view the system call status by [strace](https://linux.die.net/man/1/strace) and track the last call before waiting. Or the first call after completion to determine the cause

In short, don't let the main thread be in a wait or full state

## Memory Management

Regardless of the environment in which the application is developed, memory management is a point of constant attention. The memory of the YODAOS application is managed by the [JerryScript][] virtual machine. The virtual machine performs garbage collection by reference counting and markup elimination algorithm. When the virtual machine's heap memory is less than a certain value, the recovery mechanism is automatically triggered to ensure the memory is available. . But this does not mean that developers do not need to pay attention to the application's memory usage. Here are two common memory leak scenarios:

- Objects are referenced by global or closure variables and cannot be released

  ```js
  Var obj = {}
  setInterval(() => {
    Var timestamp = Date.now()
    Obj[timestamp] = true
  }, 1000)
  ```

- No release after creating or getting an object using [N-API][]

  ```c
  Napi_value functionExportToJS(napi_env env, napi_callback_info info) {
    Size_t argc = 1;
    Napi_value argv[argc];
    Napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
    Napi_value value = argv[0];
    Napi_ref ref = NULL;
    Napi_create_reference(env, value, 1, ref);
    // balabalabala...
    // napi_delete_reference(env, ref);
    Return NULL;
  }
  ```

- Multi-threaded callback is not enabled [Handle Scope](https://nodejs.org/docs/latest/api/n-api.html#n_api_napi_open_handle_scope)

  ```c
  Void handleAsyncCallbackFromOtherThread(uv_async_t* handle) {
    // napi_handle_scope scope;
    // napi_open_handle_scope(env, &scope);
    // balabalabala...
    Napi_create_string_utf8(...);
    // napi_close_handle_scope(env, scope);
  }
  ```

Therefore, whether it is self-contained automatic recovery, or the language that needs to manage the memory itself, after the logic is processed, the object should be released or dereferenced in time to avoid memory leaks. Developers can use `process.memoryUsage()` to get the resident memory size `rss` of the process, the memory pool size `heapTotal` of the virtual machine, and the usage size `heapUsed` of the virtual machine memory pool.

When there is a memory leak in the process, you can print `heapUsed` periodically. If the `heapUsed` continues to rise, it means that the script memory leaks. At this time, you can use [Heap Profiler] provided by [ShadowNode][](https://github.com/ Rokid/ShadowNode/blob/bc244fe51236ddc70a3fae85a888594d99fd8e7f/docs/devs/Optimization-Tips.md#heap-profiler) to generate snapshots of multiple virtual machine memory, by comparing process snapshots (Snapshot) to determine which objects are leaked.

## Exception handling

When the script exits causing the process to exit, the developer can locate the reason by looking at the call stack in the log:

```sh
TypeError: Expected a function.
    At main (/data/test.js:5:10)
    At anonymous (/data/test.js)
```

When the script has an uncaughtException, [ShadowNode][] will throw the exception into the global object `process` object. If the exception of the `process` object is not listened, [ShadowNode][] will force the exit. application. Under normal circumstances, developers should avoid the occurrence of uncaught exceptions. In addition to the common unhandled exceptions that result in unhandled exceptions, the following conditions can also result:

```js
Try {
  setTimeout(function throwAnError () {
    Console.log('Hello Yoda')
    Throw new Error('intentionally throw an error')
  }, 1000)
} catch (err) {
  Console.log('catched an intentional error')
}
```

In fact, this error can't be caught, because `setTimeout` is an asynchronous call. After 1 second, when `throwAnError` is called, the call stack is not declared. `try/catch` cannot catch this error, so it also causes [ShadowNode][] will force the current process to exit. You can avoid the process being forced to exit by:

```js
Process.on('uncaughtException', function (err) {
  // balabala...
})
```

But this is usually not a good practice, because the occurrence of an uncaught exception represents that the error is not what the developer expected, and the code that the developer expects to execute after this exception will not be executed, such as the following example, although it does not The process exits but causes a memory leak:

```js
Process.on('uncaughtException', function (err) {
  Console.log('handled function exception.')
})
Var funcs = {}
Function main (funcName, func) {
  Funcs[funcName] = func
  Funcs[funcName]()
  Delete funcs[funcName]
}
Main('func1', 'this is a string, not a function')
```

In the above example, since the value of `func` is not a `function` but a `string`, an error occurs when the seventh line is executed, although the error is caught on the first line to avoid the process exiting. However, the code in the eighth line cannot be executed, causing the reference to `func` on `funcs` to be unresolved and causing the leak of the `func` reference. So when an uncaught error occurs on the `process` object, the more common practice is a friendly prompt error (if necessary) and the active exit process after the cleanup is completed.

## Performance Tips

- Common methods:
  - Cache: caches data, calculations, etc., context-independent, speeds up processing
  - Delay: will be unnecessary logical delay processing, does not block the current interaction process, such as statistics, burying points and other logic
   - Batch processing: When an interaction contains multiple processes of the same type, they are processed in one go, such as batch I/O
- Don't rely on too many external libraries. Many library implementations have some extra overhead from the perspective of versatility.
- Do a good job under the weak network test, many problems may only be exposed when the weak network
- When performance bottlenecks occur, the benefits of optimizing business processes are often the biggest
- The most important point is to keep a focus on performance and stability during the development process. Don't go back to the problem after the development is complete.

[Node.js]: https://nodejs.org/en/
[ShadowNode]: https://github.com/Rokid/ShadowNode
[JerryScript]: https://github.com/Rokid/ShadowNode/tree/master/deps/jerry
[libtuv]: https://github.com/Rokid/ShadowNode/tree/master/deps/libtuv
[N-API]: https://nodejs.org/docs/latest/api/n-api.html
[ANRs]: https://developer.android.com/topic/performance/vitals/anr