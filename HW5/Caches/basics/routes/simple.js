
const routes = require('express').Router();

routes.get("/dayofweek",(req,res)=>{
    var dt = new Date();
    res.send(dt.getDay().toString());
   });

module.exports = routes;
