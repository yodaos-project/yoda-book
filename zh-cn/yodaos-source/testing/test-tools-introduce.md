# 测试工具

## tape（测试断言）

> https://github.com/shadow-node/tape#tape

## istanbul（代码覆盖率）

#### 安装 nyc 包

npm 工具下拉对应的包，目前 runtime 已经添加 nyc 工具包的依赖，直接 `npm install` 即可。

#### 准备工作

初始化函数，目的是为了准备覆盖率统计环境：确保当前代码是最新；清除上次可能构建遗留的历史数据；

```bash
init()
{
  echo "========init coverage env========"
  cd $WORKSPACE/$GERRIT_PROJECT/
  rm -rf node_modules
  npm install
  npm install --save-dev nyc
  rm -rf coverage
  rm -rf .nyc_output
  adb shell mount -o remount -o rw /
  adb shell mkdir -p .nyc_output
  if [ "$?" != 0 ];then
    echo "============init fail============="
  fi
}
```

#### 生成打桩文件

生成打桩文件，思路是把待统计的源文件放到指定目录，然后再生成打桩后的文件到指定目录：

```bash
getOutput()
{
  echo "========get new files Output========"
  mkdir -p source-prepare
  cp -r packages ./source-prepare/
  cp -r runtime ./source-prepare/
  cp -r apps ./source-prepare/
  cp -r res ./source-prepare/
  node_modules/.bin/nyc instrument ./source-prepare ./source-for-coverage
  if [ "$?" != 0 ];then
       echo "========getOutput==========="
    fi
}
```

#### 安装打桩文件到设备

将打桩成功的文件按照原来的目录结构 push 到设备端。

```bash
pushToDevice()
{
  echo "========pushToDevice========"
  tools/coverage-install -t
  tools/runtime-op restart
  if [ "$?" != 0 ];then
    echo "=======pushToDevice fail======="
  fi
}
```

#### 执行测试

用 tape 执行单元测试。目前 tape 已经支持覆盖率统计数据保存路径通过 `--coverage` 参数传入。

```bash
# example
$ ./tools/test --coverage '.nyc_output/xx.data' -p '**/*.test.js'
```

#### 下载结果到本地

将设备上的 `.nyc_output` 文件通过 `adb pull` 下载到到源文件同级目录如下：

```bash
pullCoverageDate()
{
  sleep 5
  echo "========pull coverage data========"
  mkdir -p .nyc_output
  adb pull /.nyc_output 
  if [ "$?" != 0 ];then
    echo "no coverage data"
  fi
}
```

#### 生成覆盖率报告

利用 nyc 根据覆盖率文件生成报告：

```bash
makeReport()
{
  echo "========make coverage report========"
  node_modules/.bin/nyc report --reporter=html
  if [ "$?" != 0 ];then
    echo "make report fail!"
  fi
}
```

### 常见问题

**设备上覆盖率文件生成位置？**

> 由执行 tape 是传入的 `--coverage` 参数决定（以上脚本是生成在设备根目录的 `.nyc_output` 目录下）。

**生成覆盖率报告报错，找不到目录 .nyc_output？**

> 因为生成报告的命令默认是从当前目录下的 `.nyc_output` 文件中去读取覆盖率文件。

**生成的覆盖率报告位置？**

> 项目根目录下，自动生成 `coverage` 目录，打开目录下的 `index.html` 文件即可。

**访问报告页面，查看源码覆盖详情，报错提示目录找不到？**

> 请确保你的源码目录跟报告的 `coverage` 目录保持平级。

**执行单测发现功能有问题？**

> 可能是安装打桩文件过程中确保非 JavaScript 文件不受影响。

**执行单测后发现生成的覆盖率文件内不是完整的 JSON 格式，导致无法生成报告？**

> 确保一个测试进程中有且只有一个地方监听到该进程结束并去生成覆盖率文件，监听进程这段逻辑已经集成到 tape 中。

### 参考文档

- https://istanbul.js.org/docs/tutorials/iotjs/