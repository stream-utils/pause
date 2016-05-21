
var after = require('after')
var assert = require('assert')
var pause = require('..')
var Stream = require('stream')

describe('pause(stream)', function () {
  it('should return a handle', function () {
    var stream = new Stream()
    var handle = pause(stream)
    assert.ok(handle && typeof handle === 'object')
  })

  describe('handle.end()', function () {
    it('should stop collecting events', function (done) {
      var cb = after(1, done)
      var stream = new Stream()
      var handle = pause(stream)

      stream.emit('data', 'ping')

      process.nextTick(function () {
        handle.end()

        stream.emit('data', 'pong')
        stream.emit('end')

        process.nextTick(function () {
          var expected = [
            ['data', 'ping']
          ]

          stream.on('data', function (data) {
            assert.deepEqual(['data', data], expected.shift())
            cb()
          })

          stream.on('end', function () {
            assert.deepEqual(['end'], expected.shift())
            cb()
          })

          handle.resume()
        })
      })
    })
  })

  describe('handle.pause()', function () {
    it('should re-emit data events', function (done) {
      var cb = after(2, done)
      var stream = new Stream()
      var handle = pause(stream)

      stream.emit('data', 'ping')
      stream.emit('data', 'pong', 'utf8')

      process.nextTick(function () {
        var expected = [
          ['ping', undefined],
          ['pong', 'utf8']
        ]

        stream.on('data', function (data, encoding) {
          assert.deepEqual([data, encoding], expected.shift())
          cb()
        })

        handle.resume()
      })
    })

    it('should re-emit end event', function (done) {
      var cb = after(1, done)
      var stream = new Stream()
      var handle = pause(stream)

      stream.emit('end')

      process.nextTick(function () {
        stream.on('end', cb)

        handle.resume()
      })
    })

    it('should re-emit events in original order', function (done) {
      var cb = after(3, done)
      var stream = new Stream()
      var handle = pause(stream)

      stream.emit('data', 'ping')
      stream.emit('data', 'pong')
      stream.emit('end')

      process.nextTick(function () {
        var expected = [
          ['data', 'ping'],
          ['data', 'pong'],
          ['end']
        ]

        stream.on('data', function (data) {
          assert.deepEqual(['data', data], expected.shift())
          cb()
        })

        stream.on('end', function () {
          assert.deepEqual(['end'], expected.shift())
          cb()
        })

        handle.resume()
      })
    })
  })
})
