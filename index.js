var nodeVersion = process.versions.node.split('.')
var pauseRequired = parseInt(nodeVersion[0]) === 0 
  && parseInt(nodeVersion[1]) < 10
  
function noop() {}

module.exports = !pauseRequired ? function() {
  return {
    end: noop,
    resume: noop
  }
} : function(obj){
  var onData
    , onEnd
    , events = [];

  // buffer data
  obj.on('data', onData = function(data, encoding){
    events.push(['data', data, encoding]);
  });

  // buffer end
  obj.on('end', onEnd = function(data, encoding){
    events.push(['end', data, encoding]);
  });

  // buffer close
  obj.on('close', onClose = function(d){
    events.push(['close']);
  });

  return {
    end: function(){
      obj.removeListener('data', onData);
      obj.removeListener('end', onEnd);
      obj.removeListener('close', onClose);
    },
    resume: function(){
      this.end();
      for (var i = 0, len = events.length; i < len; ++i) {
        obj.emit.apply(obj, events[i]);
      }
    }
  };
};
