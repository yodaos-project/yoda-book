'use strict'

module.exports = function (activity) {
  activity.on('request', function () {
    activity.light.play('system://loading.js')
      .then((res) => {
        console.log('light end', res)
      })
      .catch((err) => {
        console.log('light error', err)
      })
  })

  activity.on('destroy', function () {
    activity.light.stop('system://loading.js')
      .then((res) => {
        console.log('stop light', res)
      })
      .catch((err) => {
        console.log('something wrong when stop light', err)
      })
  })
}