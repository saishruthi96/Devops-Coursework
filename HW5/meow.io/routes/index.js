var express = require('express');
var router = express.Router();

const db = require('../data/db');
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1', {});
const key_redis = 'FRONT_PAGE_FACTS'
const key_image = 'CACHED_IMAGES'

router.get('/', async function(req, res, next) {
  //TASK 4 - read from redis - images
client.lrange(key_image, 0, -1, function(error, cached_image){  
    //TASK 3
client.get(key_redis, async function(err, cached_facts){
  // TASK 3 - Adding caching to get facts
	 if(cached_facts) 
   {		
     best_facts = JSON.parse(cached_facts);
		 res.render('index',
     {
        recentFlag: getFlag('ON'), 
        title: 'meow.io', 
        //TASK 4
        recentUploads: cached_image, 
        bestFacts: best_facts
      });
	 } else {
      //TASK - 3
		 best_facts = (await db.votes()).slice(0,100);
		 client.set(key_redis, JSON.stringify(best_facts));
     client.expire(key_redis, 10);
		 res.render('index',
     { 
      recentFlag: getFlag('ON'), 
      title: 'meow.io', 
      //TASK 4
      recentUploads: cached_image,
      //TASK - 3
      bestFacts: best_facts
     });
	}
 });
});
});

function getFlag(value)
{
  if( value == undefined)
    return false;
  if( value == 'ON' )
    return true;
  if( value == 'OFF')
    return false;
  return false;
}

module.exports = router;