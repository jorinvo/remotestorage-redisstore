var should = require('should');
var remotestorage = require('./lib/remotestorage-node-debug');
var RedisStore = require('./remotestorage-redisStore');


describe('RedisStore', function() {
  var store = new RedisStore(remotestorage);

  it('replaces the storageAdapter of the remotestorage', function(done) {
    remotestorage.storageAdapter.get().should.equal(store);
  });

  describe('#get()', function() {
    it('takes a path as argument', function() {
      store.get.should.throw();
    });
    it('returns a promise', function() {
      store.get('path').then.should.be.a('function');
    });
  });

  describe('#set()', function() {
    it('takes a path and a node as argument', function() {
      store.set.should.throw();
    });
    it('returns a promise', function() {
      store.set('path', 'node').then.should.be.a('function');
    });
  });

  describe('#set() #get()', function() {
    it('sets and gets the right value', function(done) {
      store.set('path', 'node').then(getValue);
      function getValue() {
        store.get('path').then(function(node) {
          node.should.equal('node');
          done();
        });
      }
    });
  });

  describe('#remove()', function() {
    it('returns a promise', function() {
      store.remove('path').then.should.be.a('function');
    });
    it('removes the node at the given path', function(done) {
      store.set('path', 'node').then(removeNode);
      function removeNode() {
        store.remove('path').then(checkValue);
      }
      function checkValue() {
        store.get('path').then(function(node) {
          node.should.not.equal('node');
          done();
        });
      }
    });
  });

  describe('#forgetAll()', function() {
    it('returns a promise', function() {
      store.forgetAll().then.should.be.a('function');
    });
    it('empties the storage', function(done) {
      store.set('one', 'value').then(function() {
        store.set('two', 'value').then(forget);
      });
      function forget() {
        store.forgetAll().then(checkFirstValue);
      }
      function checkFirstValue() {
        store.get('one').then(checkSecondValue);
      }
      function checkSecondValue(node) {
        node.should.be.equal(undefined);
        store.get('two').then(function(node) {
          node.should.be.equal(undefined);
          done();
        });
      }
    });
  });

  describe('#on()', function() {
    it('supports a change event', function(done) {
      store.on('change', done);
      store.set('trigger', 'change');
    });
    it('is called with a event object which has a path and an oldValue property', function(done) {
      store.on('change', function(event) {
        should.exist(event);
        event.should.have.property('path');
        event.should.have.property('oldValue');
        done();
      });
      store.set('trigger', 'change');
    });
  });
});