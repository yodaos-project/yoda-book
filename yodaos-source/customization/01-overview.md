# Yoda OS描述

## 系统架构

![flow](./01-overview-flow.png)

## 代码目录

- **apps** 集成在系统中的本地app，包括【蓝牙音乐】、【配网】、【音量】等
- **apps/cloudappclient** 云端App的本地通用客户端，处理云端App下发的逻辑，包括【若琪音乐】、【天气】、【新闻】等
- **include** 构建时依赖的头文件
- **packages** 通用模块接口，用于与系统底层服务交互，包括【日志】、【蓝牙】、【音频】、【按键】等
- **res** 资源文件包括灯光和音效
- **runtime** Yoda OS的核心服务
  - **activation** 激活服务，在设备被激活时播放唤醒词
  - **lightd** 提供灯光渲染服务
  - **multimediad** 提供多媒体播放服务
  - **otad** 提供OTA升级服务
  - **ttsd** 提供TTS播放服务
  - **vuid** VUI交互服务，处理用户的NLP
- **test**  单元测试
- **tools** 调试工具

### 编译方式

- cd $OPENWRT_ROOT
- cp ./config/leo_k18_universal_node_defconfig .config
- make defconfig
- make package/jsruntime/install V=s

### 安装目录

- apps/ -> /opts/apps 目前QQ音乐等第三方App也安装在此
- packages/ -> /usr/lib/node_modules
- res/ -> /opt/res
- runtime/ -> /usr/yoda

## VUI交互流程

![time](./01-overview-time.png)

### 说明

1. 用户的语音在云端解析完后通过MQTT服务推送相应的NLP到VUI
2. VUI服务选择对应的App处理NLP
3. 如果App的处理中包含灯光、播报等逻辑，App将通过VUI来调用对应的服务来执行逻辑