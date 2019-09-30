## 下载代码

YodaOS 的代码使用 GitHub 和 Gerrit 分别进行管理，开发者可以参考[官方下载教程](https://github.com/yodaos-project/yodaos#download-source)具体了解。

## 目录介绍

接下来先按照字母顺序，介绍下一级目录如下：

| 子目录         | 是否目录 | 描述 |
|---------------|---------|-----|
| 3rd           | 是      | 第三方软件包，包括一些从 Android 和 Linux 继承下来的包 |
| applications  | 是      | 应用目录，存放一些内置或示例应用，开发者的应用也应建在该目录下 |
| frameworks    | 是      | 框架目录，存放 OS 中核心的代码 |
| hardware      | 是      | 硬件抽象层代码，也包括主芯片和外设的硬件抽象 |
| kernel        | 是      | Linux 内核代码 |
| openwrt       | 是      | 编译目录 |
| products      | 是      | 产品目录，存放每个产品所需的若干配置与定义 |
| toolchains    | 是      | 编译工具链目录 |
| tools         | 是      | 系统工具，一般用于打包、调试和版本相关的工具 |
| uboot         | 是      | uboot 目录，子目录按照支持的芯片区分 |
| vendor        | 是      | 第三方厂家文件 |
| build.sh      | 否      | 编译镜像的主入口，包括编译每个 ipk 软件包、系统镜像和 OTA 镜像 |

接下来对几个比较重要的目录分别介绍。

### openwrt

YodaOS 使用 [OpenWRT](https://openwrt.org/) 编译系统，下面会做一个简单的介绍，需要深入了解可以到官网深入了解。

##### 代码目录

* `./scripts` 存放了一些脚本，使用了 bash、python、perl 等多种脚本语言。编译过程中，用于第三方软件包管理的 feeds 文件也是在这个目录当中。在编译过程中，使用到的脚本也统一放在这个目录中。
* `./tools` 编译时，主机需要使用一些工具软件，tools 里包含了获取和编译这些工具的命令。软件包里面有 Makefile 文件,有的还包含了 Patch。每个 Makefile 当中都有一句 `$(eval $(call HostBuild))`，这表明编译这个工具是为了在主机上使用的。
* `./config` 存放着整个系统的配置文件
* `./configs` 存放各个板级的默认配置
* `./docs` 包含了整个宿主机的文件源码的介绍，里面还有 Makefile 为目标系统生成文档。使用`make -C docs/`可以为目标系统生成文档。
* `./toolchain` 交叉编译链，这个文件中存放的就是编译交叉编译链的软件包.包括 binutils、gcc、libc 等等。
* `./target` OpenWrt 的源码可以编译出各个平台适用的二进制文件，各平台在这个目录里定义了固件和内核的编译过程。
* `./package` 存放了系统中适用的软件包,包含针对各个软件包的 Makefile。OpenWrt 定义了一套 Makefile 模板。各软件参照这个模板定义了自己的信息，如软件包的版本、下载地址、编译方式、安装地址等。在二次开发过程中，这个文件夹我们会经常打交道。事实上，通过 `./scripts/feed update -a` 和 `./scripts/feed install -a` 的软件包也会存放在这个目录之中。
  * `./rokid` 存放了 YodaOS 所需要的package。
  * `./include` OpenWrt 的 Makefile 都存放在这里。文件名为 `*.mk`。这里的文件上是在 Makefile 里被包含的，类似于库文件，这些文件定义了编译过程。
  * `./feeds` OpenWrt 的附加软件包管理器的扩展包索引目录。简单来说就是下载管理软件包的。默认 feeds 下载有 packages、management、luci、routing、telephony。如要下载其他的软件包，需打开源码根目录下面的 feeds.conf.default 文件，去掉相应软件包前面的#号，然后更新源：`./scripts/feeds update -a`，安装下载好的包：`./scripts/feeds install -a`
* `./dl` 在编译过程中使用的很多软件，刚开始下载源码并没有包含，而是在编译过程中从其他服务器下载的，这里是统一的保存目录。
* `Makefile` 在顶层目录执行make命令的入口文件。
* `rules.mk` 定义了Makefile中使用的一些通用变量和函数。
* `Config.in` 在 `include/toplevel.mk` 中我们可以看到，这是和 `make menuconfig` 相关联的文件。
* `feeds.conf.default` 是下载第三方一些软件包时所使用的地址。
   
##### 生成目录

* `./build_dir` 在前面的原始目录中，我们提到了 host 工具，toolchain 工具还有目标文件。OpenWrt 将在这个目录中展开各个软件包，进行编译，所以这个文件夹中包含3个子文件夹:
  * `./host` 在该文件夹中编译主机使用的工具软件。
  * `./toolchain-<name>` 在该文件夹中编译交叉工具链。
  * `./target-<name>` 在此编译目标平台的目标文件，包括各个软件包和内核文件。
  * `./bin` 保存编译完成后的二进制文件，包括完整的 bin 文件,所有的 ipk 文件。
* `./staging_dir` 用于保存在 build_dir 目录中编译完成的软件，所以这里也和 build_dir 有同样的子目录结构。比如，在 `target-<name>` 文件夹中保存了目标平台编译好的头文件，库文件。在我们开发自己的 ipk 文件时，编译过程中，预处理头文件，链接动态库，静态库都是到这个子文件夹中。

##### 如何添加自己的包（Package）

> 参考 https://openwrt.org/docs/guide-developer/helloworld/chapter3

##### 编译基础

- 首先通过 `cd openwrt` 进入到 openwrt 目录
- 然后拷贝你所需的 defconfig 到 `.config` 覆盖后，执行 `make defconfig`
- 最后通过 `make V=s` 编译即可

##### 使用 menuconfig 生成配置

- 运行 `make menuconfig` 完成配置修改
- 运行 `./scripts/diffconfig.sh > *_defconfig` 生成脚本

##### 编译单个包

- 清理、编译、安装单个包使用：`make package/<name>/{clean,compile,install}`
- 编译清理, 编译, 安装工具链使用：`make toolchain/{clean,compile,install}`

##### 单独编译内核

```shell
$ make target/linux/compile
```

##### 如何选择 Debug / Release

```shell
$ source envsetup.sh

You are building on Linux
Lunch menu... pick a image style:

1. debug(root filesystem bin is not striped)（目前受限于 k18 flash 的大小，debug 模式下也是不带符号表）
2. release(root filesystem bin is striped)
```

./build.sh 添加 -d 选项：

```shell
$ ./build.sh -p leo_k18_universal_node -n openwrt-leo-k18-universal -f leo-k18-universal  -j32 -r -d
```

Release 模式下，

- 自己的调试程序不需要打包到镜像
- 日志级别调到 `info`

Debug 模式下，

- config 下 `CONFIG_DEBUG` 宏会被打开
- 各软件包，根据宏定义拷贝相应的测试程序和工具到镜像中
- 日志级别调到 `debug`

### frameworks

框架目录中的结构相对比较复杂，这里只做第一层目录的介绍，如需了解更多可以在代码中具体查看：

| 子目录     | 描述 |
|-----------|------|
| aial      | 算法库、神经网络库、语音激活库、离线自然语言处理等 |
| native    | 系统功能库与服务，包括多媒体、蓝牙、音量等 |
| vm        | 应用虚拟机，包括 Node.js 和 ShadowNode |
| jsruntime | 上层 JavaScript 运行时代码 |

### yodart 介绍

[yodaos-project/yodart][] 是 [YodaOS][] 的应用层框架，下面对其做简单介绍。

| 子目录               | 描述  |
|---------------------|-------|
| include             | 构建时依赖的项目头文件 |
| packages            | 通用模块接口，用于调用系统底层服务 |
| res                 | 资源文件包括灯光和音效 |
| runtime             | 核心代码与服务 |
| test                | 单元测试 |
| tools               | 调试工具 |

由于 [yodaos-project/yodart][] 大部分是脚本语言，因此可以直接安装到设备端运行：

| 源码目录  | 设备目录 |
|----------|---------|
| res      | /opt/res |
| apps     | /opt/apps |
| runtime  | /usr/yoda |
| packages | /usr/lib/node_modules |

下面简单介绍一下语音交互的流程，如下：

![](../../../../asset/01-overview-time.png)

1. 用户的语音在云端解析完后通过 MQTT 服务推送相应的 NLP 数据到 VUI
2. VUI 服务选择对应的本地应用处理数据
3. 如果应用的处理中包含灯光、播报等逻辑，会通过 VUI 来调用对应的服务来执行逻辑

### products

Product 用于存放每个产品所需的一些配置，一个标准的产品（Product）项目需要包含以下文件或目录：

- `./configs` 当前产品的 defconfig 配置文件目录
- `./workdir_asr_cn` 语音前端的配置文件
- `./manifest.json` 该产品的配置文件，用于指定产品版本和特性
- `./CMakeLists.txt` 该产品的编译入口文件，通常用于安装资源、应用和配置等

如果想深入了解，可以查看示例项目：[yodaos-project/product-kamino18](https://github.com/yodaos-project/product-kamino18)。

[yodaos-project/yodart]: https://github.com/yodaos-project/yodart
[YodaOS]: https://github.com/yodaos-project