/*!
 * pause
 * Copyright(c) 2012 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module exports.
 * @public
 */

module.exports = pause

/**
 * Pause the data events on a stream.
 *
 * @param {object} stream
 * @public
 */

function pause(stream) {
  var events = []

  function onData(data, encoding) {
    events.push(['data', data, encoding])
  }

  function onEnd(data, encoding) {
    events.push(['end', data, encoding])
  }

  // buffer data
  stream.on('data', onData)

  // buffer end
  stream.on('end', onEnd)

  return {
    end: function end() {
      stream.removeListener('data', onData)
      stream.removeListener('end', onEnd)
    },
    resume: function resume() {
      this.end()

      for (var i = 0; i < events.length; i++) {
        stream.emit.apply(stream, events[i])
      }
    }
  }
}
