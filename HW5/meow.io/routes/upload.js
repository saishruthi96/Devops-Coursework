const multer = require('multer');
const fs = require('fs');

const db = require('../data/db');
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1', {});

var express = require('express');
var router = express.Router();
const key_image =  'CACHED_IMAGES';

const upload = multer({ dest: './uploads/' })

router.post('/', upload.single('image'), function (req, res) {
  console.log(req.body) // form fields
  console.log(req.file) // form files

  if (req.file.fieldname === 'image') {
    fs.readFile(req.file.path, async function (err, data) {
      if (err) throw err;
      var img = new Buffer.from(data).toString('base64');
      //TASK 4 - Pushing to Redis along with DB
      await client.lpush(key_image, [img]);
      await client.ltrim(key_image, 0, 4);	 	  
      // TASK 5
      await client.rpush('Queue_Images', [img]);
      // TASK 5 - pushing only to queue and not DB. Hence, commenting. 
      // await db.cat(img);
      res.send('OK');
    });
  }
});

module.exports = router;
