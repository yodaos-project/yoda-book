## 准备工作

**Ubuntu 16.04**

```sh
$ apt-get install build-essential subversion libncurses5-dev zlib1g-dev gawk gcc-multilib flex git-core gettext libssl-dev unzip texinfo device-tree-compiler dosfstools libusb-1.0-0-dev
```

**CentOS 7**

```sh
$ yum install -y unzip bzip2 dosfstools wget gcc gcc-c++ git ncurses-devel zlib-static openssl-devel svn patch perl-Module-Install.noarch perl-Thread-Queue
```

CentOS7 需手动安装 `device-tree-compiler`：

```sh
$ wget http://www.rpmfind.net/linux/epel/6/x86_64/Packages/d/dtc-1.4.0-1.el6.x86_64.rpm
$ rpm -i dtc-1.4.0-1.el6.x86_64.rpm
```

## 开始编译 

**方法1 手动拷贝**

```shell
$ cd openwrt
$ cp configs/leo_k18_universal_node_defconfig .config
$ make defconfig && make
```

**方法2 通过 `envsetup.sh` 配置**

```shell
$ source envsetup.sh
$ make
```

方法2将方法1做成自动脚本，并添加选择文件系统和 release/debug 选项。


**方法3，自动编译脚本用于发布镜像**

```sh
$ ./build.sh -p leo_k18_universal_node -n openwrt-leo-k18-universal -f leo-k18-universal  -j32 -r
```

方法3是调用方法2，并编译生成 Recovery 分区以及 OTA 固件，通常用做生产镜像发布。
