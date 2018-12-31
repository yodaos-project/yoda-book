# YODAOS Button Application Module Architecture and Customization Guidelines

## Overview

Buttons are a convenient way to operate the most direct voice commands in the voice operating system. The system framework provides some of the infrastructure necessary to handle the keys, and the custom developer provides the code to customize these infrastructures so that the buttons respond in the way the developer wants. If you want to customize a button more efficiently, it's helpful to know some about how the YODAOS infrastructure works.

## button module

The system processes the key state changes of the hardware through the button module, and distributes the button events to the corresponding modules according to a preset manner through the configured button configuration file, or registers the currently active application of the button event.

There are two ways to use the commonly used key distribution methods.

1. By way of openURL key event will be distributed to registered by the application of the url activity # url event
2. Send key events to the system runtime via runtimeMethod

Commonly used key events are as follows:

Keydown
Longpress
Keyup
4. click
5. dbclick

Among them, because longpress is an event that can be triggered multiple times by one button, it has a special button description.

## Button business description file

The key description file is a file in JSON format. The top-level key of this file is the keyCode string of each key, and the description of each key is a map with the key event as the key. As the following example:

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

The above button description describes the behavior of the “Volume Down” button. When the “Volume Down” button is pressed (keydown), the volume application is opened with url `yoda-skill://volume/volume_down` and the volume is reduced. Operation; if you press and hold the "Lengpress" button (longpress), repeat the long press event, use url `yoda-skill://volume/volume_down` to open the volume application, and perform the volume reduction operation.

## Button customization

Here we use the "Volume Reduction" button as an example to illustrate various possible button customization schemes.

### Customizing a click event

If you need to customize the click event of a button, you only need to add a button event description with the `click` key in the button's descriptor:

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

### Customizing a double click event

If you need to customize the double-click event of a button, you only need to add a button event description with the `dbclick` key in the button's descriptor:

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

### Customizing a long press event
If you need to customize a long press event for a button, you only need to add a button event description with the `longpress` key to the button's descriptor:

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

It should be noted that the above is a repeatable long press button definition. If you want the button to trigger after a long press of 5s, you need to define the time required for long press:

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

If you want the button to be triggered by a long press of 5s and only fire once, you need to set `repeat` to `false`:

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

If you want to customize multiple long press events with different long press durations, you can distinguish between multiple descriptions by adding a time suffix after the `longpress` key name:

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

If multiple long press button events are defined, the timeDelta of these long press button events is calculated starting from the time of the keydown.

### Depth customization of a button
Sometimes, for a button to be pressed from the user, until the user releases the button, you need to redefine according to the customization requirements, you need to complete different operations for the `keydown` event and the `keyup` event. Add a description of the `keydown` and `keyup` events in the button description.

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

If you want to not trigger the keyup event after a long press of the trigger event, you can increase the `preventSubsequent` field:

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

## Button event description definition

The JSON Schema for keyboard.json is defined as follows:

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
          "Description": "A URL string to be opened to handle the keyboard event",
          "examples": [
            "yoda-skill://volume/volume_down"
          ]
        },
        "options": {
          "type": "object",
          "Description": "An object to be used as options while opening url to handle the event"
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
          "Description": "A method name of which would be called to handle the event"
        },
        "params": {
          "type": "array",
          "Description": "An array of arguments on invocation of runtime method on handling of events"
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