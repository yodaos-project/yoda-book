# 灯效开发教程

## 特点

YodaOS 使用 lightd 服务管理灯光，即 App 要显示灯光效果，统一交由 lightd 去代理执行，而不推荐 App 直接去操作灯光。这样做的理由有以下几点：

- 方便开发者编写复杂的灯光效果。lightd 提供了抽象的 effects 灯光效果库，开发者使用 effects 库可以很容易的组合各种效果，并按顺序执行它。
- 资源管理。如果您只有一种灯效，那么直接操作 LED 是最简单的。如果您有 2 种灯效，那你要额外一点代码保证它们的执行顺序，如果您有 3 种以上的灯效，那么你的代码除了你知道，只剩上帝知道。
- js 中是异步的，而任何时候，如果有 2 个程序同时去操作灯光，就会出问题。如果你的灯效是在一定时间内过渡的动画，那你在执行第二个灯效的时候，就必须要手动打断它们。
- 使用了过渡动画，意味着你使用了定时器，要手动打断它们，你就必须保存这些定时器的句柄，你会发现，你的代码里全是这些定时器的句柄和取消这些定时器的代码，而真正的灯效代码只占一小部分。
- 使用 lightd 提供的 effects 库，以上这些全都交由 effects 管理了。开发者不用担心会有 2 个效果同时执行，也不用管理定时器。
- 模块化。lightd 将每个灯效文件保存为一个单独的 .js 文件，这样代码耦合度更低，可维护性和可阅读性更高，同时不用担心变量重名的问题，每个文件都是一个单独的作用域。
- 恢复机制。lightd 可以在适当的时机恢复灯效。假如当前正在播放禁麦灯效，突然来了一个音量灯效，音量灯效执行完需要恢复禁麦。lightd 会自动帮你恢复。
- 优先级机制。lightd 可以保证优先级高的灯光优先执行。优先级高的灯效总是会优先执行，灯效开发者无需担心被打断，即使被打断，也有恢复机制。系统灯效优先级是配置文件配的，对于用户灯效优先级是动态可调的。

## lightd 流程图

![](../../asset/lightd-lifecycle.png)

上图是 lightd 的流程图。lightd 提供 play(name, data, options, callback) 方法去执行灯效文件。现在，以下面调用

```js
play("/opt/light/hello.js", {}, function(error) {});
```

为例子，看一下整个流程是如何进行的。

1：首先，lightd 尝试去停止上一个灯效，如果有，则调用 prev.stop() || prev()，如果没有，则忽略。prev 是什么？先不管，请往下看。

2：然后 lightd 尝试去加载 /opt/light/hello.js 文件，hello.js 文件类似这样

```js
module.exports = function (light, data, callback) { ... }
```

即灯效文件必须导出一个函数，该函数接收 3 个参数。执行的时候，lightd 会调用这个函数。

3：如果有这个文件，则执行文件导出的方法，并且把上下文，也就是上面提到的三个参数传递进去。light 即之前提到的 effects 库的实例，data 是透传的，callback 是钩子函数，用来告诉 lightd 灯效执行完了。

4：如果没有这个文件，或者加载过程中出现错误，如文件有语法错误、运行时发生错误，那么 lightd 停止此次流程，并且执行调用方传递的 callback 函数。

5：到这里，已经进入了 hello.js，lightd 会执行你导出的函数，你可以使用 light 对象提供的各种方法去渲染灯光效果了。处理完成后，你可以返回一个对象，也就是流程图中所示的 prev。

- 返回的 prev 对象如果包含一个名为 stop 的方法。lightd 会在需要结束这个灯效时调用这个函数。你可以在 stop 函数内释放所有资源。

- 如果你的灯光不需要在停止的时候做额外的操作，那么不需要 return 语句

6：如果你的灯光是需要被恢复的，且不会自动停止的，那么不需要调用 callback，因为你的灯光永远不会自动停止。

7：如果你的灯效是会自己自动停止的。如果是一个需要一定时间完成的过渡效果，那么在异步效果完成后应该调用 callback 函数，如果你的灯效是同步完成的，那么完成后你应该调用 callback 函数。

8：callback 被调用的时候，lightd 会通知调用方的 callback，调用方根据第一个参数判断此次调用是否完成。

9：在 callback 被调用后，系统会去恢复队列中恢复优先级最高的灯光。

10：至此，一个完整的流程结束。


## lightd 方案设计简介

系统内置的灯效文件默认存放在 `/opt/light/` 下面。
用户编写的第三方灯效文件应放在应用目录内。

灯光设计遵循下面几个原则:

1. 高优先级灯光时，来了低优先级灯光，则不显示低优先级灯光。如果低优先级的灯光是需要恢复的，则放到相应的恢复队列中。
2. 同级灯光A时，来了同级灯光B，则灯光B会打断灯光A。
3. 低优先级灯光时，来了高优先级灯光，则高优先级灯光会打断低优先级灯光。
4. 当前灯光执行完毕，从恢复队列中按照优先级从高到低恢复第一个。
5. 灯效里面需要使用内置的 requestAnimationFrame 定时器。
6. 系统灯效优先级无论大小，总是高于用户灯效优先级。

按照灯效的表现可以分为2类灯效:

1. 在一定时间内明确会自己结束的。
2. 永远不会自己结束的，并且在被打断后需要恢复的。

例如:

> 音量键按下的时候，音量灯光显示一个箭头灯效，持续 100ms，然后就自己结束了，此时调用 callback，向系统表明灯效渲染完成了。这个时候系统会去队列中恢复需要恢复的灯光。

上面的音量灯效是属于第一类的，也就是在一定时间内明确会自己结束的。

> 配网灯光，会一直转圈，不会自己自动结束，并且在按下音量键后，配网灯光会被停止，音量灯光结束后，配网灯光还会恢复。

配网灯效是属于第二类的，也就是永远不会自己结束的，只能被调用方手动清除。并且被其它灯光打断后还会恢复。

开发者编写灯效时应按照上面2种类型的规范编写。

## 灯效编写方法

之前说过，灯效按照效果可以分为2类。

1. 在一定时间内明确会自己结束的。
2. 永远不会自己结束的，并且在被打断后需要恢复的。

对于这2类的灯光，开发流程是一样的，除了有2点不同：

- 对于第一类：因为在一定时间内明确会结束，并且你结束后需要恢复其它灯光，所以你应该在灯光渲染完成后，再调用 callback 函数，告诉系统你完成了。
- 对于第二类：因为需要恢复，且永远不会停止，所以这类灯光不需要调用 callback 函数，并且在调用的时候，需要有 shouldResume: true 这个属性。

### 编写不需要恢复的灯光

正如在大多数语言中都用 hello world 作为入门教程一样，硬件编程中也有 hello world，它叫 hello LED，也就是点亮一颗 LED 灯。现在，让我们用 lightd 来做一个 hello LED。不同的是，我们要点亮一圈 LED 灯，然后 500 毫秒后自动熄灭。
新建文件：/opt/light/hello.js

hello.js 的内容如下:

```js
'use strict'

// Generic notation, which derives a function for receiving parameters.
// Lightd will call this function when it needs to display this effect.
module.exports = function helloLED (light, data, callback) {
  // fill(r, g, b) It will set all lights to white
  light.fill(255, 255, 255)

  // After the lighting effects are set,
  // you need to call the render function to make the hardware take effect.
  light.render()

  // Then set a 500 millisecond timer
  light.requestAnimationFrame(function () {
    // set all lights to black
    light.fill(0, 0, 0)
    light.render()
    // Callback is called after all the lights are completed,
    // telling the system that the lighting effect is completed.
    callback()
  }, 500)
}
```

首先导出一个函数，函数接收3个参数，分别是 light：lightd 的 effects实例，该对象中包含了操作灯光的方法和内置效果，方便开发。data：用户调用灯效时传递的数据，是透传的。callback：钩子函数，在灯效完成时调用，通知 lightd 灯效完成了。所有的灯效都类似这样，只是里面的设置灯效操作不同。

然后在灯效执行的时候，lightd 会执行这个导出的函数，在函数里面，我们给灯光设置效果，使用内置的 fill(r, g, b) 函数，把所有灯光填充为 255,255,255，也就是白色。

设置完效果后，不要忘记调用 render 函数去渲染效果到 LED 硬件上。

最后，我们保持灯光长亮 500 毫秒。这里使用了内置的定时器，requestAnimationFrame(cb, time)，500 毫秒后，我们重新把灯光设置为 0,0,0，也就是全部熄灭，同样调用 render 函数渲染。

在熄灭灯光后，我们的整个灯效操作就完成了，所以我们调用 callback 函数，告诉 lightd，我们后续不会再有操作了，可以结束这个灯效了。

callback 一旦被调用后，light 对象会被置为不可用状态，所有的灯光操作方法会失效，即无法再渲染灯光，同时，定时器也不会再执行。调用方的 callback 也会立即执行。

**有几个点需要注意：**

1. 每次设置好灯光效果后，都需要调用 render 函数刷新，render 函数的调用频率受硬件限制，目前建议最低 35-40ms，如果低于这个时间，会发生丢帧。
2. 在 lightd 调用 stop 函数后，应该释放所有资源，不能再去操作灯光了。此时表示有另一个程序在操作灯光。
3. 一个灯光文件尽量只做一个效果，如果需要多段效果，则应该拆分为多个文件，然后在 callback 里依次去执行。
4. lightd 在切换多个灯效的时候，会自动保留上一个灯光的最后一帧，留到下一个灯光中，所以切换多个灯效不会产生闪烁的问题，我们叫这个：过渡

### 编写需要恢复的灯光

上面我们编写了一个最简单的灯效，现在我们来编写一个会自动恢复的灯光：呼吸灯。它会一直有呼吸效果，并且如果被其它灯光中断，呼吸灯还会自动恢复，然后我们自己手动清除它。

```js
"use strict"

module.exports = function hello (light, data, callback) {
  function render() {
    // Call the light effect library provided by lightd to realize the breathing light
    light.breathing(255, 255, 255, 1000, 30, (r, g, b) => {
      light.fill(r, g, b)
      light.render()
    }).then(() => {
      light.requestAnimationFrame(() => {
        // Recursively call the render function,
        // this light will always breathe, will not stop, unless interrupted
        render()
      }, 60)
    })
  }

  render()

  // Note: This type of light does not need to call callback
  return {
    // This hook function is called when it is interrupted,
    // if we return the stop function.
    // This stop function is optional if you don't need to care about interrupt events.
    stop: function() {}
  }
}
```

调用方通过 `light.play('breathing.js', data, { shouldResume: true }, callback)` 调用这个灯光，告诉系统，这个灯光是需要恢复的。如果中间执行了其它灯光，那么这个灯光也会自动恢复。除非用户使用 `light.stop('breathing.js')` 清除恢复的灯光。调用需要恢复的灯光，因为灯光里面不用调用 callback，所以在调用方看来，开始执行灯效的时候，callback 就会立即被调用返回。

上面我们使用了 `breathing` 效果函数，这是内置的呼吸效果，它的函数定义如下:

```js
function breathing (r, g, b, duration, fps, render(r, g, b, lastFrame)) => Promise
```

它的效果是 `rgb(0, 0, 0)` 线性变换到 `rgb(r, g, b)`，再从 `rgb(r, g, b)` 线性变换到 `rgb(0, 0, 0)`。变化的持续总时间是 `duration`，单位毫秒，变换的帧率是 `FPS`，每次变化的中间值会通过 `render` 函数回调。`lastFrame` 参数表示这是最后一帧。变化完成时，Promise 为 `resolve` 状态。

`light` 对象还有很多内置的效果函数，请参考 [API章节](https://yodaos.rokid-inc.com/docs/0.5/yodaRT.light.LightRenderingContext.html)。

**重要**

JavaScript 中 IO 操作是异步的，如果你想要做一个从 0 渐变到 255 的动画，下面的写法是无效的：

```js
module.exports = function (light, data, callback) {
  for (var i = 0; i < 256; i++) {
    light.fill(i, i, i)
    light.render()
  }
}
```

上面的效果不会产生预期的动画效果，因为它几乎在一瞬间完成了。

**有几个要注意的点：**

1. 如果灯效是需要恢复的，则不用调用 callback，因为它永远也不会自己结束，除非用户手动停止。即使调用了 callback 也是无效的，里面是一个空函数。
2. 对于 return 的值，都是可选的。如果你不需要关心 stop 事件，则不需要 return 语句。
3. 如果需要做动画，帧率尽量控制在 30FPS - 60FPS。

### 自定义灯效动画

内置实现了呼吸灯和渐变动画，下面来讲一下如何实现自定义的灯效动画。

灯光的动画原理和屏幕的动画原理是一样的，我们可以把一个LED灯当做一个像素点，我们以合适的速率去刷新LED灯的亮度值，就能看到动画效果。

下面我们做一个简单的渐变动画：亮度从0渐变到255。

```js
module.exports = function (light, data, callback) {
  var currentColor = 0
  var render = function () {
    light.fill(currentColor, currentColor, currentColor)
    currentColor++
    if (currentColor > 255) {
      return
    }
    light.requestAnimationFrame(render, 33)
  }
  render()
}
```

上面是一个最简单的动画，所有灯的亮度从 0 渐变到 255，每 33 毫秒刷新一次亮度。所有的动画都是基于这个原理。

事实上，内置的 `ransition` 和 `breathing` 也是这样实现的，只不过他们计算的颜色通道是 RGB，且加入了 FPS 和 duration 参数。

## 适配不同硬件

具体到某一款硬件产品中，灯的数量是固定了的。这样有一个问题，就是灯效必须要适配不同的硬件产品。

例如，如果在渲染过程中，灯的数量超出了，那么就会发生错误。如果灯效是为 RGB 灯光编写的，那么到了单色通道的产品中，效果可能会不对。

针对适配灯的问题，light 对象中有 ledsConfig 属性可以获取到灯的硬件配置。

```js
module.exports = function (light, data, callback) {
  
  light.ledsConfig
}
```

- `ledsConfig.leds` 返回灯的数量
- `ledConfig.format` 返回灯的通道数，现在默认都是为 3
- `ledConfig.maximumFps` 返回刷新一帧所需要的时间，单位为毫秒，表示刷新2帧之间至少需要这个时间，要不然会发送丢帧。

## 调试灯效

在 lightd 服务目录下，有 tests/lightMethod.js 文件，该文件封装好了一个方法可以直接调用 lightd 对外提供的 api。全部 api 可以查看 lightMethod.js 文件，里面每个 api 都有详细的注释和函数声明。

下面是几个常用的例子。

### 播放灯效

播放灯效是调用 play，下面我们播放之前写的 hello.js 灯效。

```js
var lightMethod = require('./lightMethod)
lightMethod.play('@testAppId', '/opt/light/hello.js', {}, {})
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })
```

把上面这些代码保存为一个 .js 文件，然后执行它，就能看到灯效了。

### 查看 lightd 日志

目前调试灯光，光靠眼睛看是不够的，尤其是多个灯光切换的时候，可以使用
`logread -f -e nice | grep lightd` 或者 `logread -f -e nice | grep lightService`
 
lightd 是灯光服务处理请求的日志，可以查看到所有 App 调用的请求。
lightService 是具体的处理逻辑部分，可以查看到每一步正在执行的动作。

如果日志较多，不方便查看，可以把 lightd 服务停掉，然后手动启动它，这样就不会有其它的日志干扰。具体步骤：
停掉 lightd 服务，使用 `/etc/init.d/lightd stop`
手动启动 lightd，进入 `/usr/lib/yoda/runtime/services/lightd/`，执行 `iotjs index.js`

然后这里就能看到所有灯光的日志了。

### 播放需要恢复的灯效

播放一个需要恢复的灯效，和播放灯效没有多大区别，只需要在 options 里面多加一个 shouldResume: true 属性。

```js
lightMethod.play('@testAppId', '/opt/light/hello.js', {}, { shouldResume: true })
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })
```

### 停止灯效

停止播放某一个灯效只需要调用 stop 方法就行了。

```js
var lightMethod = require('./lightMethod)
lightMethod.stop('@testAppId', '/opt/light/hello.js')
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log(err)
  })
```

参数和 play 方法基本是一样的，只是不需要 data 和 options 参数。

