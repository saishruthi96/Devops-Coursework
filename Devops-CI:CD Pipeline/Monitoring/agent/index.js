const redis = require('redis');
const util  = require('util');
const os = require('os');
const si = require('systeminformation');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

// Reusing and making this similar to workshop code
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(9001,'0.0.0.0',()=>{
      console.log("Listening on port 9001");
})

// Calculate metrics.
// TASK 1:
class Agent
{
    round(num) {
        return Math.round(num * 100) / 100
    }
    memoryLoad()
    {
       return ((os.totalmem() - os.freemem())/(os.totalmem()) * 100).toFixed(2);
    }
    async cpu()
    {
       let load = await si.currentLoad();
       return (load.currentload).toFixed(2) ;
    }
    async systemLoad()
    {
        let load = await si.currentLoad();
       return (load.currentload_system).toFixed(2) ;
    }    
}

(async () => 
{
    // Retrieving the agent name from the command line arguments    
    main(process.argv[2]);

})();


async function main(name)
{
    let agent = new Agent();

    let connection = redis.createClient(6379, '192.168.33.50', {})
    connection.on('error', function(e)
    {
        console.log(e);
        process.exit(1);
    });
    let client = {};
    client.publish = util.promisify(connection.publish).bind(connection);

    // Push update ever 1 second
    setInterval(async function()
    {
        let payload = {
            memoryLoad: agent.memoryLoad(),
            cpu: await agent.cpu(),
            systemLoad: await agent.systemLoad()                  
        };
        let msg = JSON.stringify(payload);
        await client.publish(name, msg);
        console.log(`${name} ${msg}`);
    }, 1000);

}



