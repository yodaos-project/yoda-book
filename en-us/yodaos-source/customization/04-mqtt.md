# YODAOS MQTT custom message processing guidelines

## Overview

In addition to interacting with the device itself, YODAOS also supports remote message interaction. For example, the most common is to send instructions to the device through the mobile phone, and the commands sent by the mobile phone are transmitted to the device through mqtt.
The system has built-in some common instructions, such as the mobile phone to send text instructions, mobile phone endpoint broadcast instructions. Sometimes the user wants to send a customized message to the device via the mobile SDK and then process it on the device side. The wormhole module allows users to extend custom messages and process them.

## Wormhole module

The message through the mobile phone SDK needs to conform to a certain format, and the format is as follows:

```json
{
  "topic": "String",
  "text": "String"
}
```

The extended wormhole module is customized through the product. The mqtt messages received by the device are distributed through the wormhole module. When an mqtt message is received, it is first determined whether the topic is registered in the product customization configuration, and if so, the message is distributed to the product customization module. If not, this message is distributed to the system's built-in listeners. If there are no registrants, this message is ignored. The customization method is described below.

## Customize custom messages through product customization

This method is configured using a json file with the file name `wormhole.json`. The configuration file format is as follows:

```json
{
  "handlers": {
    "app-with-args": {
      "url": "yoda-skill://foobar"
    },
    "naive-topic": {
      "bin": "/usr/bin/bash",
      "args": [
        "/etc/a-script"
      ],
      "withContent": true,
      "timeout": 30000
    },
    "runtime-method": {
      "runtimeMethod": "appGC",
      "params": [
        "appId"
      ]
    }
  }
}
```

Key is the topic in the message. There are 3 types of handler types:

1. url: execute a URL
2. bin: execute a shell command
3. runtimeMethod: Execute the function in runtime and use text as the last argument

Different types are distinguished by corresponding fields, and a topic supports only one type, and the priority is in the above order.

If you open the app through url, the __topic and __text fields will be added to the query of this url, which are the topic and text of wormhole respectively.

When the new handler is bin type, the boolean tag passed in as the argument to the mqtt message content is withContent.

[mobile-sdk]: https://rokid.github.io/mobile-sdk-android-docs/res/86_topic_msg.html
