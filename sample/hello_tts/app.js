'use strict'

module.exports = function (activity) {
  activity.on('request', function () {
    activity.tts.speak('hello YODAOS')
      .then((res) => {
        console.log('tts end', res)
      })
      .catch((err) => {
        console.log('tts error', err)
      })
  })
}