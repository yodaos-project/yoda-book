## YODAOS Developer Tools

[YODAOS Developer Tools](https://github.com/yodaos-project/yoda-platform-tools) provides a range of convenient tools for manipulating YODAOS devices, such as sending text commands, sending NLP intents, launching, Install applications, etc.

The YODAOS Developer Tools can be downloaded from the [YODAOS Developer Tools Releases](https://github.com/yodaos-project/yoda-platform-tools/releases) page.

## Creating a YODAOS application

With the YODAOS Developer Tools, we can quickly create a YODAOS application project:

```bash
~/workspace > yoda-cli init app awesome-demo-app
✔ Name of the package ... awesome-demo-app
✔ A short description of the package ... A demo application project
✔ Is this package private? ... no / yes
✔ Skill ids of your app ...
✔ Requested permissions of your app ... ACCESS_TTS
✔ Keywords ... demo, app
```

After running the above command, you can see the generated YODAOS application project in the `awesome-demo-app` directory in the current directory.

More `yoda-cli` commands can be viewed with `yoda-cli help`.

Once the project is built, you can install the app on your YODAOS device:

```bash
~/workspace > yoda-cli pm install awesome-demo-app

--- OR ---

~/workspace/awesome-demo-app > yoda-cli pm install .
```

## Program entry: Main function

For YODAOS, each application is a [CommonJS](https://nodejs.org/docs/latest/api/modules.html) module. Every CommonJS module will have a reference to `module.exports`, and the application of YODAOS is the same. His main entry is a function that receives a `activity` as a parameter via `module.exports`.

```javascript
Module.exports = function main (activity) {

}
```

The application interacts with the system through the `activity` object provided by the system framework, such as receiving the system, application events, and calling the system API.

### Interact with YODAOS

The `activity` provided by the system framework is an object that conforms to Node.js [EventEmitter API](https://nodejs.org/docs/latest/api/events.html#events_events), on which we can listen to any application. Life cycle events:

```javascript
Module.exports = function main (activity) {
  Activity.on('create', () => {
    /** do initialization on event `create` */
  })

  Activity.on('request', () => {
    Activity.tts.speak('Hello World')
  })
}
```

> View more lifecycle documentation: [Lifecycle](./02-lifetime.md)

## Application Manifest

In addition to the program code, the application needs to declare its own identity, permission request and other information, so that YODAOS allocates resources to the application, distributes NLP, and so on. The package.json of the YODAOS app contains this information:

```json
{
  "name": "com.company.example.awesome-app",
  "version": "1.0.0",
  "main": "app.js",
  "manifest": {
    "skills": [
      "an-pre-registered-skill-id"
    ],
    "permission": [
      "ACCESS_TTS",
      "ACCESS_MULTIMEDIA"
    ]
  }
}
```

Package.json is similar to the [npm](https://www.npmjs.com/) package, but for YODAOS applications, the most important of these is name and manifest: the former declares the local ID of the application, the latter Declare the permissions, skill IDs, etc. that need to be requested from YodaRuntime.

> View more package.json Description document: [Apply Manifest](./04-app-manifest.md)

## Processing voice requests

After writing the NLP matching rules on the Rokid developer website, you can write the following code in the application code to process the voice request:

```javascript
Module.exports = function main (activity) {
  Activity.on('request', nlp => {
    Activity.tts.speak(`Hello, ${nlp.slots.value}`)
  })
}
```

## Processing URL requests

The application can evoke other applications in the form of URLs and entrust the current interaction to the application that can handle the URL.

If you want to process the URL of a domain name, you need to register the URL in the app's package.json . Here's an example of registering a foobar.app domain name:

```json
{
  "manifest": {
    "skills": ["AVERYLONGSKILLID"],
    "hosts": [
      [ "foobar.app", { "skillId": "AVERYLONGSKILLID" } ]
    ]
  }
}
```

> See more apps Manifest Document: [Apply Manifest](./04-app-manifest.md#manifesthosts)

After registering such a domain name, other applications can evoke the application by calling:

```javascript
activity.openURL('yoda-skill://foobar.app/example')
```

An application that has registered the domain name can process the URL request with the following code:

```javascript
Module.exports = function main (activity) {
  Activity.on('url', urlObject => {
    Activity.tts.speak(`Opened URL ${url.pathname}`)
  })
}
```

> See more documentation for URL Object: [Legacy urlObject](https://nodejs.org/docs/latest/api/url.html#url_legacy_urlobject)
