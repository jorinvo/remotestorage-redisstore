var crypto = require('crypto');
var redis = require('redis').createClient();


redis.on("error", function (err) {
  console.log("Error " + err);
});


//rs = remotestorage
function RedisStore(rs) {
  rs.util.extend(this, rs.util.getEventEmitter('change'));
  this.getPromise = rs.util.getPromise;
  this.asyncEach = rs.util.asyncEach;
  this.bind = function(fn) {
    return rs.util.bind(fn, this);
  };
  this.prefix = crypto.randomBytes(6).toString() + '.';

  rs.storageAdapter.set(this);
  console.log('INFO: found redis storage');
}


RedisStore.prototype = {

  get: function(path) {
    var promise = this.getPromise();
    redis.get(this.path(path), function(err, res) {
      if (err) console.log('GET Error:', err);
      promise.fulfillLater(res);
    });
    return promise;
  },

  set: function(path, node) {
    var promise = this.getPromise();
    redis.set(this.path(path), node, this.bind(function(err) {
      if (err) console.log('SET Error:', err);
      this.emit('change', {path: path});
      promise.fulfillLater();
    }));
    return promise;
  },

  remove: function(path) {
    var promise = this.getPromise();
    redis.del(this.path(path), function(err) {
      if (err) console.log('DEL Error:', err);
      promise.fulfillLater();
    });
    return promise;
  },

  forgetAll: function() {
    var promise = this.getPromise();
    redis.keys(this.prefix + '*', this.bind(function(err, res) {
      if (err) console.log('KEYS Error:', err);
      this.asyncEach(res, deleteKey).then(function() {
        promise.fulfill();
      });
      function deleteKey(key) {
        redis.del(key, function(err) {
          if (err) console.log('DEL Error:', err);
        });
      }
    }));
    return promise;
  },

  //private

  path: function(path) {
    return this.prefix + path;
  }

};


module.exports = RedisStore;