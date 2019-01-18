# YODAOS Lighting Service Architecture and Customization Guidelines

## Overview

The light is divided into two parts, one is the upper part of the lightd application frame, and the other is the underlying rendering part, which is the part of this document that will be described.
The upper application framework abstracts the apis that operate the lights. The user only needs to know how many lights are there and then operate the lights. By default each light is in RGB format.
But in this part of the hardware, in addition to knowing how many lights there are, you also need to know the format of the lights. For example, above the Me is the RGB light, above the NABOO is the monochrome PWM light.

The problems that need to be described in this part of the document are mainly the following

- How to configure the system built-in lighting effect
- How to receive frame data passed by the light application framework
- How to convert the frame data passed by the application framework into the actual light format and then render.

## Configuring System Lighting Effects

The built-in lighting effects file is stored under /opt/light/ by default and can be configured in the lightd service.

Configure the path of the system build-in lighting effect file:

1. Edit the file: `/usr/yoda/services/lightd/service.js`.
2. Configure the value of this field `var LIGHT_SOURCE = '/opt/light/'` Note that the last side requires a slash `/`.

From the configuration file, the lighting effect files can be divided into two types:

1. System lighting effect file.
2. User light effect file.

### System Light Effect File Definition

The system light effect is configured in `${LIGHT_SOURCE}/config.json`. The content of this file is the json object. The key saves the relative path of the system's lighting effect. The value is the priority of the light. The smaller the priority number of the system lighting effect, the higher the priority. That is 0 is the highest.

The system light effect maintains a layer, which is an array that holds all the lights to be restored. There can only be one light effect per layer, and the number of layers indicates the priority. That is, if a system light is to be restored, the light will be saved to the system layer. Look for it from the 0th floor when recovering. The maximum number of layers in the layer is determined by the largest number in the config.json file.

The following is an example of the contents of a `config.json` file:

```json
{
  "setVolume.js": 0,
  "setMuted.js": 1,
  "awake.js": 2,
  "longPressMic.js": 2,
  "loading.js": 3,
  "setPickup.js": 3,
  "setSpeaking.js": 4,
  "bluetoothOpen.js": 3,
  "bluetoothConnect.js": 3
}
```

Only the light effect files declared in this file are defined as `System Light Effect`.

> System Light Effect Priority Why is 0 the maximum?

Assume that the higher the number, the higher the priority. Pre-defined 10 lighting effects, if you want to add a lower priority lighting effect, then increase all the numbers to 1.
The system-defined priority will not be changed at runtime. Generally, in the definition phase, the highest priority is defined first, so it is natural that starting from 0, 1234 is in order.

### User Light Effect File Definition

All non-system lighting effects are defined as user lighting effects. That is, even if your file is in the system directory, it is not declared in the `config.json` file, it is still user-friendly.

The user's lighting effect does not need to be defined, and there is no pre-declared priority, so its priority is the runtime, which is dynamically specified by the caller.

User lighting also has a layer. Only this layer is the smaller the number, the lower the priority, the default is 0. When recovering, look up from the largest layer until the 0th floor. The maximum number of layers is configured by the lightd service. If the call is out of range, it is automatically limited to the range. For example, if the maximum range is exceeded, the default is the maximum number of layers.

Configure the maximum number of layers in the user layer:

1. Edit the file: `/usr/yoda/services/lightd/service.js`
2. Configure the value of this field `var maxUserspaceLayers = 3` Note that you need an integer greater than 0.

The higher the priority number of the user's lighting effect, the higher the priority.

> User Light Effect Priority Why is 0 Minimum?

Suppose, if 0 is the maximum, then when I call a user light effect, how much priority should I pass?
The priority of the user's lighting effect is dynamically specified at runtime. If you want to call a higher priority light effect, the number will naturally increase by 1, so it starts from 0.

## Lightd Application Layer Workflow

### Lightd Architecture

The lightd is divided into two parts:

 - One is the upper JavaScript application framework, responsible for abstracting hardware apis and managing resources.
 - The second is the underlying hardware rendering library, which is responsible for rendering the lighting effects of the upper application settings to the hardware.

### Led Data Structure

From the perspective of the JavaScript application framework, the default is now the RGB data format. Even the monochrome PWM lamp is used as the RGB operation. The underlying rendering library automatically converts the RGB to a single when the data stream is passed to the hardware rendering. The data format is arranged in RGB RGB... order. The value of each channel is an 8-bit integer. That is, the value of each channel is between 0-255.

Let's take the hardware with 5 RGB lights as an example to see how the real data is represented in lightd.

5 lights, each of which is an RGB channel, so the length of the `frame` frame is 5 * 3 = 15, which is 15 bytes, so the real data structure is:

```c++
char* frame = new char[5 * 3]
```

> noun explanation: frame
> frame represents the data needed to refresh all the lights one frame.

## Hardware Layer Workflow

#### LED HAL Parameter Configuration

- LED driver attribute classification
Make menuconfig -> rokid -> Hardware Layer Solutions ->
There are three types of LED drivers: PWM format, MCU side I2C, ARM side I2C (take kamino18 as an example)
- Number of LED lights
Make menuconfig -> rokid -> Hardware Layer Solutions ->
The number of led lights can be controlled by `BOARD_LED_NUMS`

-------

#### LED HAL Code Logic
- Standard android hardware layer architecture, code directory: `kamino18/hardware/modules/leds/`
- HAL layer code basic format

```c
 Static struct hw_module_methods_t led_module_methods = {
     .open = led_dev_open,
 };

 Struct hw_module_t HAL_MODULE_INFO_SYM = {
     .tag = HARDWARE_MODULE_TAG,
     .module_api_version = LEDS_API_VERSION,
     .hal_api_version = HARDWARE_HAL_API_VERSION,
     .id = LED_ARRAY_HW_ID,
     .name = "ROKID PWM LEDS HAL",
     .methods = &led_module_methods,
 };
```

- Calling method of HAL layer:
Hw_get_module(LED_ARRAT_HW_ID, (const struct hw_module_t **)&module);
- Processing application layer sent RGB data
The first entry function `led_draw()` mainly implements the following functions:
+ If it is a three-color lamp in RGB format, directly write to the underlying driver in the corresponding order
+ If it is a PWM controlled monochromatic lamp, it will respond to convert the RGB data into grayscale value by `rgb_to_gray()` to the driver layer.
+ The above lights automatically discard the transparency value