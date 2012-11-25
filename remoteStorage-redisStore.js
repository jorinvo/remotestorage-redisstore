var crypto = require('crypto');
var redis = require('redis').createClient();


redis.on("error", function (err) {
  console.log("Error " + err);
});


//rs = remotestorage
function RedisStore(rs) {
  rs.util.extend(this, rs.util.getEventEmitter('change'));
  this.getPromise = rs.util.getPromise;
  this.prefix = crypto.randomBytes(6).toString() + '.';

  rs.storageAdapter.set(this);
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
    redis.set(this.path(path), node, function(err) {
      if (err) console.log('SET Error:', err);
      promise.fulfillLater();
    });
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
    redis.keys(this.prefix + '*', function(err, res) {
      if (err) console.log('KEYS Error:', err);
      res.forEach(deleteKey);
      function deleteKey(key) {
        redis.del(key, function(err) {
          if (err) console.log('DEL Error:', err);
            promise.fulfillLater();
        });
      }
    });
    return promise;
  },

  //private

  path: function(path) {
    return this.prefix + path;
  }

};


module.exports = RedisStore;