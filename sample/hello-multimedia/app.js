'use strict'

module.exports = function (activity) {
  activity.on('request', function () {
    // http://www.domian.com/media_source.mp3
    // /path/to/local/media_source.mp3
    activity.media.start('/path/to/your/media_source')
      .then((res) => {
        console.log('play complete', res)
      })
      .catch((err) => {
        console.log('something wrong', err)
      })
  })

  activity.on('pause', function () {
    activity.media.pause()
      .then((res) => {
        console.log('pause media', res)
      })
      .catch((err) => {
        console.log('something wrong when pause media', err)
      })
  })

  activity.on('resume', function () {
    activity.media.resume()
      .then((res) => {
        console.log('resume media', res)
      })
      .catch((err) => {
        console.log('something wrong when resume media', err)
      })
  })

  activity.on('active', function () {
    activity.media.resume()
      .then((res) => {
        console.log('resume media', res)
      })
      .catch((err) => {
        console.log('something wrong when resume media', err)
      })
  })

  activity.on('destroy', function () {
    activity.media.stop()
      .then((res) => {
        console.log('stop media', res)
      })
      .catch((err) => {
        console.log('something wrong when stop media', err)
      })
  })
}