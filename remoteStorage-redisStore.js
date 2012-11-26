var crypto = require('crypto');
var redis = require('redis-url');




//rs = remotestorage
function RedisStore(rs, redisUrl) {
  rs.util.extend(this, rs.util.getEventEmitter('change'));
  this.util = rs.util;
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
    return this.promise(function(promise) {
      this.client.get(this.path(path), this.bind(function(err, res) {
        if (err) {
          console.log('GET Error:', err);
          promise.fail(err);
          return;
        }
        promise.fulfill(this.unpackData(res));
      },this));
    });
  },

  set: function(path, node) {
    return this.promise(function(promise) {
      this.client.set(this.path(path), this.packData(node), this.bind(function(err) {
        if (err) {
          console.log('SET Error:', err);
          promise.fail(err);
          return;
        }
        this.emit('change', {path: path});
        promise.fulfill();
      }));
    });
  },

  remove: function(path) {
    return this.promise(function(promise) {
      this.client.del(this.path(path), function(err) {
        if (err) {
          console.log('DEL Error:', err);
          promise.fail(err);
          return;
        }
        promise.fulfill();
      });
    });
  },

  forgetAll: function() {
    return this.promise(function(promise) {
     this.client.keys(this.prefix + '*', this.bind(function(err, res) {
        if (err) {
          console.log('KEYS Error:', err);
          promise.fail(err);
          return;
        }
        this.util.asyncEach(res, this.bind(deleteKey)).then(function() {
          promise.fulfill();
        });
      }));
      function deleteKey(key) {
        return this.promise(function(promise) {
          this.client.del(key, function(err) {
            if (err) {
              console.log('DEL Error:', err);
              promise.fail(err);
              return;
            }
            promise.fulfill();
          });
        });
      }
    });
  },

  //private

  promise: function(fn) {
    return this.util.makePromise(this.bind(fn));
  },

  path: function(path) {
    return this.prefix + path;
  },


  //TODO: reuse these functions from remotestorage.js - store/common

  packData: function (node) {
    node = this.util.extend({}, node);
    if(typeof(node.data) === 'object' && node.data instanceof ArrayBuffer) {
      node.binary = true;
      node.data = this.util.encodeBinary(node.data);
    } else {
      node.binary = false;
      if(node.mimeType === 'application/json' && typeof(node.data) === 'object') {
        node.data = JSON.stringify(node.data);
      } else {
        node.data = node.data;
      }
    }
    return JSON.stringify(node);
  },

  unpackData: function (node) {
    node = this.util.extend({}, JSON.parse(node));
    if(node.mimeType === 'application/json' && typeof(node.data) !== 'object') {
      node.data = JSON.parse(node.data);
    } else if(node.binary) {
      node.data = this.util.decodeBinary(node.data);
    }
    return node;
  }

};





module.exports = function(remotestorage, redisUrl) {
  return new RedisStore(remotestorage, redisUrl);
};