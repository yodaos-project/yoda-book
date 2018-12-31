每一个 YodaOS 应用都需要存在一个 package.json 文件在应用根目录。这个 package.json 文件描述了一些关于应用的必要信息。

这个 package.json 必须声明以下信息：

- 应用的包名。
- 应用的技能 ID。
- 应用运行时需要访问系统中被保护的部分 API 的权限。

接下来几节就会详细叙述应用开发中几个重要的部分是如何反映到 Manifest 中去的。

## 包名与技能 ID

在若琪开发者平台上创建了本地技能并获取到技能 ID 后，为了将这个技能与本地的应用关联起来，需要在应用的 package.json 中填写 `manifest.skills` 字段，如下例子：

```json
{
  "name": "com.company.example.awesome-app",
  "manifest": {
    "skills": [
      "an-pre-registered-skill-id"
    ]
  }
}
```

## 权限

YodaOS 应用必须申请权限来获取访问一些系统功能（如 TTS 或者媒体播放器）。每一个权限都由一个全局唯一的标识来表示。

如一个应用需要使用 TTS 与媒体播放器功能，则他的 package.json 中必须包含以下几行：

```json
{
  ...
  "manifest": {
    "permission": [
      "ACCESS_TTS",
      "ACCESS_MULTIMEDIA"
    ]
  }
  ...
}
```

# Manifest 元素参考

## name

**&lt;string&gt;** *Required*

一个应用的本地唯一名称就是他的 name 字段。

一些规则：

- 包名可能会作为 URL 的一部分，或者作为一个命令行的参数，或者一个文件夹的名字。因此，这个名字不能包含任何 URL 不安全的字符；
- 不能使用 Node.js 的核心模块名作为包名。

## main

**&lt;string&gt;** Default: index.js

代表了应用的默认启动入口文件。YodaOS 会使用这个入口文件启动应用。默认使用应用根目录的 index.js。

## manifest.skills

**&lt;array&gt;** Default: []

代表了应用所关联的所有技能的 ID 序列。YodaOS 在用户语音输入并完成解析后，需要将这句语音分发到可以处理这个语音所表达的意图的应用中去，而这个分发的过程就依赖应用在若琪开发者网站中所申请的技能的信息，所以应用需要将自己的技能 ID 在 package.json 中枚举。

Example:
```json
{
  "manifest": {
    "skills": [
      "AVERYLONGSKILLID"
    ]
  }
}
```

## manifest.permission

**&lt;array&gt;** Default: []

代表了应用所希望申请的所有权限的标识。

可能的权限标识：

权限标识 | 描述
--- | ---
ACCESS_TTS | 播报 TTS 的权限
ACCESS_MULTIMEDIA | 使用媒体播放器播放媒体的权限
ACCESS_VOICE_COMMAND | 代替用户使用文本执行命令的权限
ACCESS_MONOPOLIZATION | 独占活跃状态，防止被其它激活的应用打断和当前用户的交互的权限
INTERRUPT | 打断当前应用，获取活跃状态的权限

Example:
```json
{
  "manifest": {
    "permission": [
      "ACCESS_TTS",
      "ACCESS_MULTIMEDIA"
    ]
  }
}
```

## manifest.hosts

**&lt;array&gt;** Default: []

代表了应用能处理的 yoda-skill 的域名。YodaOS 应用可以使用 API 如 Activity#openURL 来打开一个如 `yoda-skill://an-app-registered-host/path/to/resources` 的 URL，并通过 URL 参数将希望传递的参数发送给能够处理这个 URL 的应用。而一个应用如果希望 YodaOS 将一个域名的 URL 代理给自己，则需要在 package.json 中注册这个域名。

manifest.hosts 字段需要是一个数组，这个数组的元素都是第一位是域名、第二位是域名参数的元组。域名参数是一个包含 `skillId` 字段的 JSON Object。

Example:

```json
{
  "manifest": {
    "hosts": [
      [ "example.app", { "skillId": "AVERYLONGSKILLID" } ]
    ]
  }
}
```

## manifest.daemon

**&lt;boolean&gt;** Default: false

如果应用希望在 YodaOS 一准备好就立刻启动，而不是等到用户语音触发命令后再启动应用；并且在处理完语音请求后还希望继续保持进程运行，而不是在处理完所有语音请求后立刻退出进程，就需要将 manifest.daemon 选项设置为 true。

Example:
```json
{
  "manifest": {
    "daemon": true
  }
}
```
