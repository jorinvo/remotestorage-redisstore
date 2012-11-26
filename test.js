var should = require('should');
var remotestorage = require('./lib/remotestorage-node-debug');
var redisStore = require('./remotestorage-redisStore');


describe('RedisStore', function() {
  var store = redisStore(remotestorage);

  var json = {
    mimeType: 'application/json',
    data: {
      test: 'node'
    }
  };
  var string = {
    data: 'test'
  };
  var binary = {
    data: new ArrayBuffer(32)
  };

  it('replaces the storageAdapter of the remotestorage', function() {
    remotestorage.store.getAdapter().should.equal(store);
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

  it('stores objects', function(done) {
    store.set('path/', json).then(getValue);
    function getValue() {
      store.get('path/').then(function(node) {
        node.data.should.eql(json.data);
        done();
      });
    }
  });

  it('stores strings', function(done) {
    store.set('path/', string).then(getValue);
    function getValue() {
      store.get('path/').then(function(node) {
        node.data.should.eql(string.data);
        done();
      });
    }
  });

  it('stores binary data', function(done) {
    store.set('path/', binary).then(getValue);
    function getValue() {
      store.get('path/').then(function(node) {
        node.data.should.eql(binary.data);
        done();
      });
    }
  });

  describe('#remove()', function() {
    it('returns a promise', function() {
      store.remove('path/').then.should.be.a('function');
    });
    it('removes the node at the given path', function(done) {
      store.set('path/', {test: 'node'}).then(removeNode);
      function removeNode() {
        store.remove('path/').then(checkValue);
      }
      function checkValue() {
        store.get('path/').then(function(node) {
          node.should.not.have.property('test');
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
      store.set('one/', json).then(function() {
        store.set('two/', json).then(forget);
      });
      function forget() {
        store.forgetAll().then(checkFirstValue);
      }
      function checkFirstValue() {
        store.get('one/').then(checkSecondValue);
      }
      function checkSecondValue(node) {
          node.should.not.have.property('data');
        store.get('two/').then(function(node) {
          node.should.not.have.property('data');
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