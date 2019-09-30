# YODAOS 按键应用模块架构及客制化指引

## 概述

按键是语音操作系统处理最直接的语音命令之外较为方便的操作方式。系统框架会提供一些按键处理必需的基础设施，而客制化开发者提供客制化这些基础设施的代码，让按键按照开发者所想的方式响应。如果想要更加效率地客制化一个按键，了解一些关于 YodaOS 基础设施是如何工作的会提供一些帮助。

## 按键模块

系统通过按键模块处理硬件的按键状态变化，并通过配置的按键配置文件将按键事件按照预设的方式分发到相应的模块，亦或是注册了该按键事件的当前活跃应用。

常用的按键分发方式有以下两种方式

1. 通过 openURL 的方式将按键事件通过 activity#url 事件来分发到注册了该 url 的应用中
2. 通过 runtimeMethod 的方式将按键事件发送到系统运行时中

常用的按键事件有以下几种：

1. keydown
2. longpress
3. keyup
4. click
5. dbclick

其中，因为 longpress 是可以一次按键多次触发的事件，它拥有特殊的按键描述。

## 按键业务描述文件

按键描述文件是一个 JSON 格式的文件。这个文件的顶级 key 即为各个按键的 keyCode 字符串，而每一个按键的描述是一个以按键事件为 key 的 map。如以下例子：

```json
{
  "114": {
    "keydown": {
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    },
    "longpress": {
      "repeat": true,
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false
      }
    }
  }
}
```

以上的按键描述描述了“音量减”按键的行为，当按下“音量减”键时（keydown），就使用 url `yoda-skill://volume/volume_down` 打开音量应用，并执行音量减的操作；如果再长按“音量减”键（longpress），那么就重复（repeat）执行长按事件，使用 url `yoda-skill://volume/volume_down` 打开音量应用，并执行音量减的操作。

## 按键客制化

这里我们以“音量减”按键为例子，例举各种可能的按键客制化方案。

### 定制一个单击事件

如果需要定制一个按键的单击事件，只需要在按键的描述器中加入以 `click` 为键的按键事件描述即可：

```json
{
  "114": {
    "click": {
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    }
  }
}
```

### 定制一个双击事件

如果需要定制一个按键的双击事件，只需要在按键的描述器中加入以 `dbclick` 为键的按键事件描述即可：

```json
{
  "114": {
    "dbclick": {
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    }
  }
}
```

### 定制一个长按事件
如果需要定制一个按键的长按事件，只需要在按键的描述器中加入以 `longpress` 为键的按键事件描述即可：

```json
{
  "114": {
    "longpress": {
      "repeat": true,
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    }
  }
}
```

需要注意的是，以上是一个可以重复的长按按键定义，如果希望按键在长按 5s 后触发，则需要定义长按所需的时间：

```json
{
  "114": {
    "longpress": {
      "repeat": true,
      "timeDelta": 5000,
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    }
  }
}
```

如果希望按键在长按 5s 触发，并且只触发一次，则需要将 `repeat` 置为 `false`：

```json
{
  "114": {
    "longpress": {
      "repeat": false,
      "timeDelta": 5000,
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    }
  }
}
```

如果希望客制多个不同长按时长的长按事件，可以通过在 `longpress` 键名后增加时间后缀来区分多个描述：

```json
{
  "114": {
    "longpress-5000": {
      "repeat": false,
      "timeDelta": 5000,
      "preventSubsequent": true,
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    },
    "longpress-7000": {
      "repeat": false,
      "timeDelta": 7000,
      "preventSubsequent": true,
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    }
  }
}
```

如果定义了多个长按按键事件，这些长按按键事件的 timeDelta 的计算都是以按键 keydown 的时间为起始时间。

### 深度定制一个按键

有时候，对于一个按键从用户按下该按键，到用户松开该按键，都需要按照客制化需求重新定义，则需要对 `keydown` 事件和 `keyup` 事件都完成不同的操作，则可以在按键描述中增加 `keydown` 和 `keyup` 事件的描述。

```json
{
  "114": {
    "keydown": {
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    },
    "keyup": {
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false
      }
    }
  }
}
```

如果希望在长按触发事件后，不触发 keyup 事件，可以增加 `preventSubsequent` 字段：

```json
{
  "114": {
    "longpress": {
      "repeat": false,
      "timeDelta": 5000,
      "preventSubsequent": true,
      "url": "yoda-skill://volume/volume_down",
      "options": {
        "preemptive": false,
      }
    }
  }
}
```

## 按键事件描述定义

keyboard.json 的 JSON Schema 定义如下：

```json
{
  "definitions": {
    "OpenUrlDef": {
      "$id": "#/definitions/OpenUrlDef",
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "format": "uri",
          "description": "A URL string to be opened to handle the keyboard event",
          "examples": [
            "yoda-skill://volume/volume_down"
          ]
        },
        "options": {
          "type": "object",
          "description": "An object to be used as options while opening url to handle the event"
        }
      },
      "required": [
        "url"
      ]
    },
    "RuntimeMethodDef": {
      "$id": "#/definitions/RuntimeMethodDef",
      "type": "object",
      "properties": {
        "runtimeMethod": {
          "type": "string",
          "description": "A method name of which would be called to handle the event"
        },
        "params": {
          "type": "array",
          "description": "An array of arguments on invocation of runtime method on handling of events"
        }
      },
      "required": [
        "runtimeMethod"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://yodaos.rokid-inc.com/keyboard.schema.json",
  "type": "object",
  "title": "The Root Schema",
  "properties": {
    "config": {
      "type": "object",
      "title": "The Config Schema",
      "properties": {
        "debounce": {
          "type": "integer",
          "default": 0,
          "examples": [
            400
          ],
          "description": "time shall be passed before handling next incoming event, defined in milliseconds"
        },
        "longpressWindow": {
          "type": "integer",
          "default": 0,
          "examples": [
            500
          ],
          "description": "longpress events shall emit on every given milliseconds"
        }
      }
    }
  },
  "patternProperties": {
    "^[0-9]+$": {
      "type": "object",
      "patternProperties": {
        "^keydown|keyup|click|dbclick$": {
          "type": "object",
          "properties": {
            "debounce": {
              "type": "integer",
              "default": 0,
              "description": "time shall be passed before handling next incoming event, defined in milliseconds"
            }
          },
          "oneOf": [
            {
              "type": "object",
              "$ref": "#/definitions/OpenUrlDef"
            },
            {
              "type": "object",
              "$ref": "#/definitions/RuntimeMethodDef"
            }
          ]
        },
        "^longpress(-[0-9]+)?$": {
          "type": "object",
          "properties": {
            "debounce": {
              "type": "integer",
              "default": 0,
              "description": "time shall be passed before handling next incoming event, defined in milliseconds"
            },
            "timeDelta": {
              "type": "integer",
              "default": 0,
              "description": "expected time shall a key been pressed to trigger the event"
            },
            "repeat": {
              "type": "boolean",
              "default": false,
              "description": "if the event shall be triggered repeatedly"
            },
            "preventSubsequent": {
              "type": "boolean",
              "default": false,
              "description": "if subsequent event of same key shall be ignored until next keydown"
            }
          },
          "oneOf": [
            {
              "type": "object",
              "$ref": "#/definitions/OpenUrlDef"
            },
            {
              "type": "object",
              "$ref": "#/definitions/RuntimeMethodDef"
            }
          ]
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```
