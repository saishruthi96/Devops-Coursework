## Using express and redis

Part 1. [Setup and Overview](README.md)    
Part 2. [Using express and redis](Basics.md) ⬅️    
Part 3. [Using caches and queues in meow.io](Meow.md)  

### Creating a simple route in express

Change into the `cd basics/` directory. Start the service using `npx nodemon index.js`, which will reload the process whenever you change any of the script files.

``` | {type: 'terminal'}
```

**Task 1.** Implement a day of week service.

Modify the code to add a new route, `/dayofweek` that will return the current day of the week as a number.  *Hint:* You can use `new Date()` to obtain an object with the current time.

```js | {type: 'file', path: 'basics/routes/simple.js'} 
const routes = require('express').Router();

// Add your route here...

module.exports = routes;
```

Try accessing your endpoint!

```bash | {type: 'command', failed_when: 'exitCode!=0'}
curl -ss localhost:3003/dayofweek
```

### Creating a simple storage api

We will be creating a self-destruct message service.

**Task 2.** Self-destruct message service.

Create two routes, `/tape` and `/read` the meet the following spec, using the redis key store.

```
# Post content to server. Service returns retrieval link.
$ curl --request POST -H "Content-Type: application/json" --data '{"message":"Your mission Jim, should you decide to accept it"}' http://localhost:3003/tape
{"success":true,"link":"http://localhost:3003/read/4be24cf5-7ed6-443a-8bbf-f3298cb08ed1"}
# Retrieve content
$ curl http://localhost:3000/read/4be24cf5-7ed6-443a-8bbf-f3298cb08ed1
{"message": "Your mission Jim, should you decide to accept it",
"ttl": "This message will self-destruct in 10 seconds" }
$ sleep 3
$ curl http://localhost:3000/read/4be24cf5-7ed6-443a-8bbf-f3298cb08ed1
{"message": "Your mission Jim, should you decide to accept it",
"ttl": "This message will self-destruct in 7 seconds" }
```

You can use `const { v4: uuidv4 } = require('uuid');` to generate a unique key.
After the key is read, use the [EXPIRE](https://redis.io/commands/expire) command to make sure this key will expire in 10 seconds. Use the [TTL](https://redis.io/commands/ttl) to get the time-to-live value of the key.

```js | {type: 'file', path: 'basics/routes/api.js'} 
const routes = require('express').Router();

// REDIS
const redis = require('redis');
let client = redis.createClient(6379, '192.168.44.81', {});
  
// Task 1 ===========================================

// Task 2 ============================================

module.exports = routes;
```

Tape your secret message.

``` bash | {type: 'command', failed_when: 'exitCode != 0'}
curl -ss --request POST -H "Content-Type: application/json" --data '{"message":"Your mission Jim, should you decide to accept it"}' http://localhost:3003/tape
```

If on Windows, use this version:
``` bash | {platform: 'windows', type: 'command', failed_when: 'exitCode != 0'}
curl -ss --request POST -H "Content-Type: application/json" --data "{\"message\":\"Your mission Jim, should you decide to accept it\"}" http://localhost:3003/tape
```

Edit the curl command to call the retrieve given message. Call again to confirm, descending TTL, and confirm empty message when TTL <=0.

``` bash | {type: 'command', failed_when: 'exitCode != 0'}
curl -ss
```

## Next

We will be moving on to learning about more advanced storage mechanisms in redis in Part 3. [Using caches and queues in meow.io](Meow.md).  
