Every YodaOS application needs to have a package.json file in the application root. This package.json file describes some of the necessary information about the application.

This package.json must declare the following information:

- The package name of the app.
- The skill ID of the app.
- The application runtime needs access to some of the protected APIs in the system.

The next few sections detail how several important parts of application development are reflected in Manifest.

## Package Name and Skill ID

After creating a local skill on the Ruoqi developer platform and getting the skill ID, in order to associate this skill with the local application, you need to fill in the `manifest.skills` field in the application's package.json , as in the following example:

```json
{
  "name": "com.company.example.awesome-app",
  "manifest": {
    "skills": [
      "an-pre-registered-skill-id"
    ]
  }
}
```

## permissions

YodaOS apps must request permission to gain access to some system features (such as TTS or media player). Each permission is represented by a globally unique identifier.

If an application needs to use the TTS and media player features, the following lines must be included in his package.json:

```json
{
  ...
  "manifest": {
    "permission": [
      "ACCESS_TTS",
      "ACCESS_MULTIMEDIA"
    ]
  }
  ...
}
```

# Manifest Element Reference

## name

**&lt;string&gt;** *Required*

The local unique name of an application is its name field.

Some rules:

- The package name may be part of the URL, either as a command line argument or as a folder name. Therefore, this name cannot contain any URL unsafe characters;
- You cannot use the core module name of Node.js as the package name.

## main

**&lt;string&gt;** Default: index.js

Represents the default startup entry file for the app. YodaOS will use this entry file to launch the app. The index.js of the application root is used by default.

## manifest.skills

**&lt;array&gt;** Default: []

A sequence of IDs representing all the skills associated with the app. After the user voice input and parsing, YodaOS needs to distribute the speech to the application that can handle the intent expressed by the voice. The distribution process depends on the skills applied by the application in the Ruoqi developer website. Information, so the app needs to enumerate its skill ID in package.json.

Example:
```json
{
  "manifest": {
    "skills": [
      "AVERYLONGSKILLID"
    ]
  }
}
```

## manifest.permission

**&lt;array&gt;** Default: []

Represents the identity of all permissions that the application wishes to apply for.

Possible permission identifiers:

Permission ID | Description
--- | ---
ACCESS_TTS | Broadcast TTS permissions
ACCESS_MULTIMEDIA | Permission to play media using the media player
ACCESS_VOICE_COMMAND | Replaces the user's permission to execute commands using text
ACCESS_MONOPOLIZATION | Exclusively active, prevents permissions from being interrupted by other activated applications and interacting with the current user
INTERRUPT | Interrupt the current application and gain access to the active state

Example:
```json
{
  "manifest": {
    "permission": [
      "ACCESS_TTS",
      "ACCESS_MULTIMEDIA"
    ]
  }
}
```

## manifest.hosts

**&lt;array&gt;** Default: []

Represents the domain name of the yoda-skill that the app can handle. YodaOS applications can use an API such as Activity#openURL to open a URL such as `yoda-skill://an-app-registered-host/path/to/resources` and send the parameters they wish to pass to the URL with the URL parameter. The application of this URL. An application that wants YodaOS to proxy the URL of a domain name to itself needs to register the domain name in package.json.

The manifest.hosts field needs to be an array. The elements of this array are the tuples where the first is the domain name and the second is the domain name parameter. The domain name parameter is a JSON Object containing the `skillId` field.

Example:

```json
{
  "manifest": {
    "hosts": [
      [ "example.app", { "skillId": "AVERYLONGSKILLID" } ]
    ]
  }
}
```

## manifest.daemon

**&lt;boolean&gt;** Default: false

If the application wants to start immediately when YodaOS is ready, instead of waiting for the user's voice to trigger the command, and then wants to continue the process after processing the voice request, instead of exiting the process as soon as all voice requests have been processed , you need to set the manifest.daemon option to true.

Example:
```json
{
  "manifest": {
    "daemon": true
  }
}
```