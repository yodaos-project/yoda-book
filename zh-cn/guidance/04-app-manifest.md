每一个 YodaOS 应用都需要存在一个 package.json 文件在应用根目录。这个 package.json 文件描述了一些关于应用的必要信息。

这个 package.json 必须声明以下信息：

- 应用的包名。
- 应用的域名。

接下来几节就会详细叙述应用开发中几个重要的部分是如何反映到 Manifest 中去的。

## 包名与域名

应用如果希望接收 Url 事件并与外部组件通信，Url 域名是一个必不可少的元素，为了将一个 Url 与应用关联起来，需要在应用的 package.json 中填写 `manifest.hosts` 字段，如下例子：

```json
{
  "name": "com.company.example.awesome-app",
  "manifest": {
    "hosts": [
      "an-awesome-host"
    ]
  }
}
```

# Manifest 元素参考

## name

**&lt;string&gt;** *Required*

一个应用的本地唯一名称就是他的 name 字段。

一些规则：

- 包名可能会作为 Url 的一部分，或者作为一个命令行的参数，或者一个文件夹的名字。因此，这个名字不能包含任何 Url 不安全的字符；
- 不能使用 Node.js 的核心模块名作为包名。

## main

**&lt;string&gt;** Default: index.js

代表了应用的默认启动入口文件。YodaOS 会使用这个入口文件启动应用。默认使用应用根目录的 index.js。

## manifest.hosts

**&lt;array&gt;** Default: []

代表了应用能处理的 yoda-app 的域名。YodaOS 应用可以使用 API 如 Application#openUrl 来打开一个如 `yoda-app://an-app-registered-host/path/to/resources` 的 Url，并通过 Url 参数将希望传递的参数发送给能够处理这个 Url 的应用。而一个应用如果希望 YodaOS 将一个域名的 Url 代理给自己，则需要在 package.json 中注册这个域名。

`manifest.hosts` 字段需要是一个数组，这个数组的元素都是第一位是域名、第二位是可选的域名参数的元组。

Example:

```json
{
  "manifest": {
    "hosts": [
      "example.app"
    ]
  }
}
```

## manifest.daemon

**&lt;boolean&gt;** Default: false

如果应用希望在 YodaOS 一准备好就立刻启动，而不是等到用户希望使用时在启动；并且在意外崩溃时能够得到保护、快速重新启动，就需要将 manifest.daemon 选项设置为 true。

Example:
```json
{
  "manifest": {
    "daemon": true
  }
}
```
