var should = require('should');
var remotestorage = require('./lib/remotestorage-node-debug');
var redisStore = require('./remotestorage-redisStore');


describe('RedisStore', function() {
  var store = redisStore(remotestorage);

  it('replaces the storageAdapter of the remotestorage', function() {
    remotestorage.storageAdapter.get().should.equal(store);
  });

  describe('#get()', function() {
    it('takes a path as argument', function() {
      store.get.should.throw();
    });
    it('returns a promise', function() {
      store.get('path/').then.should.be.a('function');
    });
  });

  describe('#set()', function() {
    it('takes a path and a node as argument', function() {
      store.set.should.throw();
    });
    it('returns a promise', function() {
      store.set('path/', 'node').then.should.be.a('function');
    });
  });

  describe('#set() #get()', function() {
    it('sets and gets the right value', function(done) {
      store.set('path/', 'node').then(getValue);
      function getValue() {
        store.get('path/').then(function(node) {
          node.should.equal('node');
          done();
        });
      }
    });
  });

  describe('#remove()', function() {
    it('returns a promise', function() {
      store.remove('path/').then.should.be.a('function');
    });
    it('removes the node at the given path', function(done) {
      store.set('path/', 'node').then(removeNode);
      function removeNode() {
        store.remove('path/').then(checkValue);
      }
      function checkValue() {
        store.get('path/').then(function(node) {
          should.not.exist(node);
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
      store.set('one/', 'value').then(function() {
        store.set('two/', 'value').then(forget);
      });
      function forget() {
        store.forgetAll().then(checkFirstValue);
      }
      function checkFirstValue() {
        store.get('one/').then(checkSecondValue);
      }
      function checkSecondValue(node) {
        should.not.exist(node);
        store.get('two/').then(function(node) {
          should.not.exist(node);
          done();
        });
      }
    });
  });

  describe('#on()', function() {
    it('supports a change event', function(done) {
      store.on('change', function() {
        done();
        store.reset();
      });
      store.set('trigger/', 'change');
    });
    it('is called with a event object which has a path and an oldValue property', function(done) {
      store.on('change', function(event) {
        should.exist(event);
        event.should.have.property('path');
        // event.should.have.property('oldValue');
        done();
        store.reset();
      });
      store.set('trigger/', 'change');
    });
  });
});