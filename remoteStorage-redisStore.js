var crypto = require('crypto');
var redis = require('redis-url');




//rs = remotestorage
function RedisStore(rs, redisUrl) {
  rs.util.extend(this, rs.util.getEventEmitter('change'));
  this.getPromise = rs.util.getPromise;
  this.asyncEach = rs.util.asyncEach;
  this.bind = function(fn) {
    return rs.util.bind(fn, this);
  };
  this.prefix = crypto.randomBytes(6).toString() + '.';

  rs.storageAdapter.set(this);
  console.log('INFO: found redis storage');

  this.client = redis.connect(redisUrl);
  this.client.on("error", function (err) {
    console.log("Error " + err);
  });

}


RedisStore.prototype = {

  get: function(path) {
    var promise = this.getPromise();
    this.client.get(this.path(path), function(err, res) {
      if (err) console.log('GET Error:', err);
      promise.fulfillLater(res);
    });
    return promise;
  },

  set: function(path, node) {
    var promise = this.getPromise();
    this.client.set(this.path(path), node, this.bind(function(err) {
      if (err) console.log('SET Error:', err);
      this.emit('change', {path: path});
      promise.fulfillLater();
    }));
    return promise;
  },

  remove: function(path) {
    var promise = this.getPromise();
    this.client.del(this.path(path), function(err) {
      if (err) console.log('DEL Error:', err);
      promise.fulfillLater();
    });
    return promise;
  },

  forgetAll: function() {
    var promise = this.getPromise();
    this.client.keys(this.prefix + '*', this.bind(function(err, res) {
      if (err) console.log('KEYS Error:', err);
      this.asyncEach(res, this.bind(deleteKey)).then(function() {
        promise.fulfill();
      });
      function deleteKey(key) {
        this.client.del(key, function(err) {
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


module.exports = function(remotestorage, redisUrl) {
  return new RedisStore(remotestorage, redisUrl);
};