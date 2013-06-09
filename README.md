#RemoteStorage RedisStorage Adapter
This storage adapter is intended to replace the default in-memory storage when using remotestorage.js with node.js.

#Usage
* Run `npm install --save remotestorage-redisstore`
* make sure you have [redis](//redis.io) running

###Use it in your code as in the following example:###
```javascript
var remotestorage = require('./nodemodules/remotestorage-redisstore/lib/remotestorage-node-debug');
require('remotestorage-redisstore')(remotestorage);
```
optionally specify a redis-url:
```javascript
var REDISURL = process.env.REDISTOGO_URL || 'redis://localhost:6379';
require('remotestorage-redisstore')(remotestorage, REDISURL);
```


#Contribute
1. `git clone git@github.com/jorin-vogel/remotestorage-redisstore.git`
2. `cd remotestorage-redisstore`
3. `npm install`
4. in second terminal: `redis-server`
5. `npm test`