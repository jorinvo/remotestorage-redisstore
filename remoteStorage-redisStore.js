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
    var promise = this.util.getPromise();
    this.client.get(this.path(path), this.bind(function(err, res) {
      if (err) console.log('GET Error:', err);
      promise.fulfillLater(this.unpackData(res));
    },this));
    return promise;
  },

  set: function(path, node) {
    var promise = this.util.getPromise();
    this.client.set(this.path(path), this.packData(node), this.bind(function(err) {
      if (err) console.log('SET Error:', err);
      this.emit('change', {path: path});
      promise.fulfillLater();
    }));
    return promise;
  },

  remove: function(path) {
    var promise = this.util.getPromise();
    this.client.del(this.path(path), function(err) {
      if (err) console.log('DEL Error:', err);
      promise.fulfillLater();
    });
    return promise;
  },

  forgetAll: function() {
    var promise = this.util.getPromise();
    this.client.keys(this.prefix + '*', this.bind(function(err, res) {
      if (err) console.log('KEYS Error:', err);
      this.util.asyncEach(res, this.bind(deleteKey)).then(function() {
        promise.fulfill();
      });
    }));
    function deleteKey(key) {
      this.client.del(key, function(err) {
        if (err) console.log('DEL Error:', err);
      });
    }
    return promise;
  },

  //private

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