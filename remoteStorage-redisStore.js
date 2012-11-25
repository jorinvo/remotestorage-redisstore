require('redis');

//rs = remotestorage
var RedisStore = function(rs) {
  this.getPromise = rs.util.getPromise;
  rs.util.extend(this, rs.util.getEventEmitter('change'));
};


RedisStore.prototype = {

  get: function(path) {
    var promise = this.getPromise();
    return promise;
  },

  set: function(path, node) {
    var promise = this.getPromise();
    return promise;
  },

  remove: function(path) {
    var promise = this.getPromise();
    return promise;
  },

  forgetAll: function() {
    var promise = this.getPromise();
    return promise;
  }

};


module.exports = RedisStore;