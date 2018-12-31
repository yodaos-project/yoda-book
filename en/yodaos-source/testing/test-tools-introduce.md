# Testing Tools

## Unit test tool: tape

### Introduction to single test tools

https://github.com/shadow-node/tape#tape

## Coverage Statistics Tool istanbul

### Usage

#### Installing the nyc package

The npm tool pulls down the corresponding package. Currently, the runtime has added the dependency of the nyc toolkit, directly npm install.

### Preparing for coverage environment

The initialization function is to prepare the coverage statistics environment: to ensure that the current code is up-to-date; to clear the historical data that may be built last time;
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

#### Generating piling files

Generate a piling file. The idea is to put the source file to be counted into the specified directory, and then generate the piling file to the specified directory.
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

#### push Piling files to device

Push the successfully piling file to the device side according to the original directory structure.
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

#### Execution unit test

Perform unit tests with tape. Currently tape has supported the coverage statistics save path passed in via the --coverage parameter.
```
 //example
 tools/test --coverage '.nyc_output/xx.data' -p '**/*.test.js'
```
#### pull coverage file to local

Pull the device side .nyc_output file to the same level as the source file directory.
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
#### Generating Coverage Report

Use nyc to generate a report based on the coverage file.
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

### Q & A

- Q1: Where is the coverage file generation location on the device?

- A1: Determined by the execution of the tape --the coverage parameter (the above script is generated in the .nyc_output directory of the device root).

- Q2: Generate coverage report error, can't find directory .nyc_output?

- A2: Because the command to generate the report defaults to reading the coverage file from the .nyc_output file in the current directory.

- Q3: Is the generated coverage report location?

- A3: Under the project root directory, the coverage directory is automatically generated, and the index.html file in the directory can be opened.

- Q4: Visit the report page to view the source code coverage details. The error message indicates that the directory cannot be found.

- A4: Make sure your source directory is level with the reported coverage directory.

- Q5: Is there a problem with the single test discovery function?

- A5: It may be that the push piling file process ensures that non-js files are not affected.

- Q6: After performing the single test, it is found that the generated coverage file is not in the complete json format, resulting in the failure to generate a report.

- A6: Make sure there is only one place in a test process that listens to the end of the process and generates a coverage file. The logic of the listener process is already integrated into the tape.

### Reference Document
https://istanbul.js.org/docs/tutorials/iotjs/