#RemoteStorage RedisStorage Adapter
This storage adapter is intended to replace the default in-memory storage when using remotestorage.js with node.js.

#Usage
~~~js
var remotestorage = require('./nodemodules/remotestorage-redisstore/lib/remotestorage-node-debug');
require('remotestorage-redisstore')(remotestorage);
~~~
optionally specify a redis-url:
~~~js
require('remotestorage-redisstore')(remotestorage, process.env.REDISTOGO_URL);
~~~


#Contribute
1. `git clone git@github.com/jorin-vogel/remotestorage-redisstore.git`
2. `cd remotestorage-redisstore`
3. `npm install`
4. in second terminal: `redis-server`
5. `npm test`