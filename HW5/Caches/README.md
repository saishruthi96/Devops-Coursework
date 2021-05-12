Caches and Queues Workshop
=========================

In this workshop, we'll cover the basics of adding infrastructure components to a web application, meow.io.
In particular, we will focus on using redis to construct basic infrastructure components, such as a cache and queue, and intergrating them into a web application.

Part 1. [Setup and Overview](README.md) ⬅️  
Part 2. [Using express and redis](Basics.md)  
Part 3. [Using caches and queues in meow.io](Meow.md)  

``` | {type: 'youtube'}
https://www.youtube.com/embed/qZK88sLrE5w
```

> Note: This video has lots of extra bloopers, so hopefully, that will help you adopt strategies on how to get unstuck!

## Setup

### Before you get started

Import this as a notebook or clone this repo locally. Also, ensure you [install latest version of docable](https://github.com/ottomatica/docable-notebooks/blob/master/docs/install.md)!

```bash
docable-server import https://github.com/CSC-DevOps/Caches
```

Create a new virtual machine that will be configured with redis and node.js:

```bash | {type: 'command', stream: true, failed_when: 'exitCode != 0'}
bakerx run
```

> Note: Run `bakerx ssh meow.io` to connect to the virtual machine.

### A simple in-memory data store

You will be using [redis server](http://redis.io/) and [node-redis client](https://github.com/mranney/node_redis) to build some simple infrastructure components:

```js
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1');
```

In general, you can run all the [redis commands](https://redis.io/commands) in the following manner: `client.CMD(args)`. For example:

```js
client.set("key", "value");
client.get("key", function(err,value){ console.log(value)});
```

🎯 You can interactively run redis commands using the `redis-cli` program. Try it out!

``` | {type: 'terminal' }
```

📜 We'll use the node-redis client api to do the same task. Run the following script!

```js | {type: 'script'}
const redis = require("redis");

// Prepare client connection
let client = redis.createClient(6379, '192.168.44.81', { connect_timeout: 5000 });

// Set and retrieve a key
client.set( "hello", "redis", (err, res) => {

  console.log(`Set: "hello" => ${res}`);

  client.get("hello", (err, res) => {
    console.log( `Get: "hello" => "${res}"`);
    
    // Terminate client connection (otherwise we'd hang)
    client.end(true);
  })
});
```

### A simple web server

In this workshop we use [express](http://expressjs.com/) to make a simple web server:

```js
let server = app.listen(3003, function () {

  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
})
```

Express uses the concept of routes to use pattern matching against requests and sending them to specific functions. You can simply write back a response body:

```js
app.get('/', function(req, res) {
	res.send('hello world')
})
```

🎯 Try it out!

From our host machine, change into `cd basics`, and then `npm install.` We will then start the server with `node index.js`.

``` | {type: 'terminal' }
```

🌏 Visit the web server on http://localhost:3003/ in another tab or click the <kbd>Reload</kbd> button to load the server:

<button onclick="window.frames['serviceFrameSend'].src+='';">Reload</button>
<iframe id="serviceFrameSend" src="http://localhost:3003/" width="800" height="200"  frameborder="1"></iframe>

When you are done, use <kbd>Control</kbd>+<kbd>C</kbd> to stop the server.


## Next

We will get more hands on practice with express and redis in, Part 2. [Using express and redis](Basics.md).

