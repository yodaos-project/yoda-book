How YodaOS Universal configures systems and applications
================================



#### Download code

1. Google Repo:

```sh
$ repo init -u ssh://{yourname}@openai-corp.rokid.com:29418/kamino_universal_cust/open-platform/manifest -m yodaos-7.27.0-alpha-20181030.xml
```

2. Rokid Repo:

```sh
$ repo init -u ssh://{yourname}@openai-corp.rokid.com:29418/kamino_universal_cust/open-platform/manifest -m yodaos-7.27.0-alpha-20181030.xml -repo-url=ssh: //{yourname}@openai-corp.rokid.com:29418/tools/repo --no-repo-verify
```

#### Code Structure

```sh
* ├── 3rd: third-party software package
    ├── applications :Applications
    ├── build.sh -> /home/hailiang.xu/naboo/products/rokid/common/build.sh :ci compile script
    ├── envsetup.sh -> /home/hailiang.xu/naboo/products/rokid/common/envsetup.sh : local compilation script
    ├──frames: application frameworks, native services, commands, libraries, and abstractions to third parties, etc.
    ├── hardware : HAL (hardware abstract layer), including hardware abstraction of the main chip and peripherals
    ├── kernel: kernel
    ├── Makefile -> /home/hailiang.xu/naboo/products/rokid/common/Makefile: External makefile
    ├── openwrt:[openwrt directory](#openwrt_folder)
    ├── products: product related file directory
    ├── toolchains: compile toolchain
    ├── tools: system tools
    ├── uboot:uboot
    └── vendor: third-party manufacturer files
```

#### Installing Compilation Dependent Tools

**ubuntu 16.04**

```sh
$ sudo apt-get install build-essential subversion libncurses5-dev zlib1g-dev gawk gcc-multilib flex git-core gettext libssl-dev unzip texinfo device-tree-compiler dosfstools libusb
```

**CentOS 7**

```sh
$ yum install -y unzip bzip2 dosfstools wget gcc gcc-c++ git ncurses-devel zlib-static openssl-devel svn patch perl-Module-Install.noarch perl-Thread-Queue
```

CentOS7 needs to manually install `device-tree-compiler`

```sh
$ wget http://www.rpmfind.net/linux/epel/6/x86_64/Packages/d/dtc-1.4.0-1.el6.x86_64.rpm
$ rpm -i dtc-1.4.0-1.el6.x86_64.rpm
```

#### Compiling

Method 1, manual copy

```sh
$ cd openwrt
$ cp configs/leo_k18_universal_node_defconfig .config
$ make defconfig
$ make
# If you want to view the detailed compilation information, please add V=s parameter
# If you want to speed up compilation, please add -j parameter
```

Method 2, compile with `source envsetup.sh`:

```sh
You're building on openwrt
Lunch menu...pick a combo:

    1. leo_gx8010_ota_1v
    2. leo_gx8010_rkd_1v
    3. leo_gx8010_rkd_2v
    4. leo_gx8010_rkd_3v
    5. leo_gx8010_rkd_4v
    6. leo_gx8010_rkd_naboo
    7. leo_gx8010_rkd_naboo_yodaos
    8. leo_gx8010_ssd_1v
    9. leo_k18_cus360
    10. leo_k18_dev31
    11. leo_k18_dev32
    12. leo_k18_dev33
    13. leo_k18_dev34
    14. leo_k18_universal_avs
    15. leo_k18_universal
    16. leo_k18_universal_node
    17. leo_k18_cus360_native
    18. leo_gx8010_rkd_naboo_chinateleom

    Which would you like? [6] 16

    You are building on Linux
    Echo Lunch menu... pick a root filesystem:
    1. ubifs(root filesystem is read wirte)
    2. squashfs(root filesystem is read only)
    Which would you like? [1]1

    You are building on Linux
    Lunch menu... pick a image style:
    1. debug (root filesystem bin is not striped)
    2. release(root filesystem bin is striped)
    Which would you like? [1]1
    /home/hailiang.xu/k18/openwrt
    ~/k18/openwrt ~/k18
    ====================================================

    #TARGET_BOARD=k18
    #BUILD_TYPE=32
    #CONFIG=leo_k18_universal_node_defconfig

    ====================================================
    #
    # configuration written to .config
    #
    1
    Set configure Debug info ...
    Merging /home/hailiang.xu/k18/products/rokid/common/rokidos_debug_config.frag
    Merging /home/hailiang.xu/k18/products/rokid/common/rokidos_debug_packages.frag
    Merging /home/hailiang.xu/k18/products/rokid/common/rokidos_debug_noset_package.frag
    Merge DEBUG info success
    ~/k18
    
$ make -j32
#Method2 Make Method 1 an automatic script and add the Select File System and release/debug options.
```

Method 3, the automatic compilation script is used to publish the image:

```sh
$ ./build.sh -p leo_k18_universal_node -n openwrt-leo-k18-universal -f leo-k18-universal -j32 -r
```

Method 3 is to call method 2 and compile and generate the Recovery partition and the OTA firmware, which is usually used for production image publishing.

#### Firmware Address

* Refer to Chapter 6 of the Rokid Kamino18 Universal Install Guide V2.5.pdf for a brief description.
* Generate firmware in openwrt/bin/leo-k18-universal-glibc/

```sh
-rwxr-xr-x 1 xhl staff 57K 10 16 23:40 bootmusic.wav
-rwxr-xr-x@ 1 xhl staff 332K 10 17 00:35 bootx
Drwxr-xr-x 8 xhl staff 256B 10 16 23:40 bootx_win
-rwxr-xr-x 1 xhl staff 1.9K 10 16 23:40 download.bat
-rwxr-xr-x 1 xhl staff 3.1K 10 17 15:55 download.sh
-rw-r--r-- 1 xhl staff 256K 10 17 00:26 env.bin
-rwxr--r-- 1 xhl staff 386B 10 16 23:40 gen_swupdate_img.sh
-rw-r--r-- 1 xhl staff 162K 10 17 00:09 mcu.bin
-rw-r--r-- 1 xhl staff 1.4K 10 17 00:26 md5sums
-rw-r--r-- 1 xhl staff 2.0M 10 17 00:26 openwrt-leo-k18-universal-app.img
-rw-r--r-- 1 xhl staff 4.0M 10 17 00:26 openwrt-leo-k18-universal-fit-uImage.itb
-rw-r--r-- 1 xhl staff 22M 10 17 00:26 openwrt-leo-k18-universal-rootfs.tar.gz
-rw-r--r-- 1 xhl staff 27M 10 17 00:26 openwrt-leo-k18-universal-squashfs.img
-rw-r--r-- 1 xhl staff 37K 10 17 00:10 openwrt-leo-k18-universal-u-boot-spl.bin
-rw-r--r-- 1 xhl staff 346K 10 17 00:10 openwrt-leo-k18-universal-u-boot.img
-rw-r--r-- 1 xhl staff 4.0M 10 17 00:26 openwrt-leo-k18-universal-uImage
-rw-r--r-- 1 xhl staff 27M 10 17 00:26 openwrt-leo-k18-univers
```

* Compile method 3, copy the firmware to openwrt/bin/leo-k18-universal-glibc/full_images, and compress the full_images to check_by_jenkins for publishing.
    
#### Burning firmware

**Linux**

```sh
$ cd openwrt/bin/leo-k18-universal-glibc/
$ sudo cp bootx /usr/local/bin/
$ ./download.sh all
# Press and hold BOOT_KEY on the debug board as prompted, then connect the USB cable to the PC.
```

**Windows**


Before using the Windows programming tool, you need to install the usb driver for a new computer (drive installation files and instructions in `leo-k18-universal-glibc/bootx_win/driver_install`
Under the directory), the specific programming process on the Windows computer is as follows:

* Go to the $(K18DIR)/openwrt/bin/ leo-k18-universal-glibc /full_images directory
* Double click download.bat
* Press and hold BOOT_KEY on the debug board as prompted, then connect the USB cable to the PC.

### Customizing systems and applications

YodaOS is based on the openwrt build system, so you need to understand the optimized directory structure.

#### OpenWrt Directory Structure

##### Original Directory

* `scripts` stores some scripts, using bash, python, perl and many other scripting languages. The feeds file for third-party package management is also in this directory during compilation. During the compilation process, the scripts used are also placed in this directory.
* `tools` When compiling, the host needs to use some tools, and the tools contain commands to get and compile these tools. There are Makefiles in the package, and some include patches. There is a `$(eval $(call HostBuild))` in each Makefile, which means that the tool is compiled for use on the host.
* `config` stores the configuration file of the entire system
* `configs` stores the default configuration of each board level
* `docs` contains an introduction to the source code of the entire host machine, and there is a Makefile to generate documentation for the target system. Use `make -C docs/` to generate documentation for the target system.
* `toolchain` cross-compilation chain, which stores the packages that compile the cross-compilation chain, including binutils, gcc, libc, and so on.
* The source code of `target` OpenWrt can compile the binary files applicable to each platform. Each platform defines the firmware and kernel compilation process in this directory.
* `package` stores the applicable packages in the system, including Makefiles for each package. OpenWrt defines a set of Makefile templates. Each software defines its own information with reference to this template, such as the version of the software package, download address, compilation method, installation address, and so on. In the secondary development process, we will deal with this folder frequently. In fact, packages via `./scripts/feed update -a` and `./scripts/feed install -a` will also be stored in this directory.
  * `rokid` stores the packages required by YodaOS.
  * `include` OpenWrt Makefiles are stored here. The file name is `*.mk`. The files here are included in the Makefile, similar to library files, which define the compilation process.
  * `feeds` OpenWrt's extension package index directory for the add-on package manager. Simply put, download the management package. The default feeds download has packages, management, luci, routing, telephony. To download other packages, open the feeds.conf.default file in the root directory of the source, remove the ## in front of the corresponding package, and update the source: `./scripts/feeds update -a`, install and download Package: `./scripts/feeds install -a`
* `dl` A lot of software used in the compilation process, just downloading the source code is not included, but downloaded from other servers during the compilation process, here is a unified save directory.
* `Makefile` Executes the entry file for the make command in the top-level directory.
* `rules.mk` defines some common variables and functions used in the Makefile.
* `Config.in` In `include/toplevel.mk` we can see that this is the file associated with `make menuconfig`.
* `feeds.conf.default` is the address used to download some third-party packages.
* LICENSE & README This is the basic description of the software license and software. The README describes the basic process and dependent files for compiling the software.
   
###### Build directory

* `build_dir` In the previous original directory, we mentioned the host tool, the toolchain tool, and the target file. OpenWrt will expand each package in this directory and compile it, so this folder contains 3 subfolders:
  * `host` Compile the tools used by the host in this folder.
  * `toolchain-XXX` Compile the cross toolchain in this folder.
  * `target-XXX` Compile the target files of the target platform here, including individual packages and kernel files.
  * `bin` Saves the compiled binary, including the complete bin file, all ipk files.
  * `staging_dir` is used to save the compiled software in the build_dir directory, so it has the same subdirectory structure as build_dir. For example, the target platform compiled header file and library file are saved in the target-XXX folder. When we develop our own ipk file, during the compilation process, the preprocessor header file, the link dynamic library, and the static library are all in this subfolder.
  * `tmp` temporary folder, there are a lot of intermediate temporary files to be saved during the compilation process, all here.
  * `logs` log folder, get information from here when an error is encountered, analyze the reason for the compilation failure.

#### How to generate a customized configuration

* Use `make menuconfig` to complete the configuration changes.
* Generate configuration using the `diffconfig.sh` script.

```sh
$ ./scripts/diffconfig.sh > configs/<board level>_defconfig
```

#### How to compile a single package

Clean, compile, and install a single package:

```sh
$ make package/<name>/{clean,compile,install}
```

Compile cleanup, compile, install toolchain:

```sh
$make toolchain/{clean,compile,install}
```

#### How to compile uboot separately

Compile uboot

```sh
$ make package/uboot-leo/compile
```

Install to the `openwrt/bin/` directory

```sh
$ make package/uboot-leo/install
```

#### How to compile the kernel separately

Compile module

```sh
$ make target/linux/compile
```

Compile zImage, dts, install to the `openwrt/bin/` directory

```sh
$ make target/linux/install
```

#### How to modify the kernel configuration

```sh
$ make kernel_menuconfig
```

#### How to choose Debug/Release

```sh
$ source envsetup.sh

You are building on Linux
Lunch menu... pick a image style:

1. debug (root filesystem bin is not striped) (currently limited by the size of k18 flash, also in the debug mode without a symbol table)
2. release(root filesystem bin is striped)
```

./build.sh adds the -d option:

```sh
$ ./build.sh -p leo_k18_universal_node -n openwrt-leo-k18-universal -f leo-k18-universal -j32 -r -d
```

Release mode

1. Your own debugger does not need to be packaged into the image.
2. Set the default log level in RKLog to info.

In Debug mode

1. The CONFIG_DEBUG macro will be opened under config;
2. Each software package copies the corresponding test program and tools into the image according to the macro definition;
3. Set the default log level in RKLog to debug;
4. Subsequent DEBUG mode will be added to gdb, strace, valgrind software;

#### How to add your own package

> Please refer to https://openwrt.org/docs/guide-developer/helloworld/chapter3

#### How to control whether the system service is booted

Take the alab-libs repository as an example. Developers need our front-end activation library, but don't want to boot. View `package/rokid/alab-libs/Config.in` default
It is booting up, if it does not need to be booted.

* `make menuconfig`
* Remove the checkbox in `rokid/alab-libs/Configuration`

```sh
    menu "Configuration"

    config TURENPROC_AUTO_RUN
        bool "auto run"
        default y
        help
            turenproc service auto run

    endmenu
```

Then check `alab-libs/Makefile` to determine if booting is started according to whether or not `TURENPROC_AUTO_RUN` is selected in menuconfig.

```sh
if [ "$(CONFIG_TURENPROC_AUTO_RUN)" != "y" ]; then \
  (SED) "s/^START/#START/g" $(1)/etc/init.d/turenproc;
fi
```