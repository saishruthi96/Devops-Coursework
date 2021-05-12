const redis = require('redis');
const util  = require('util');
const os = require('os');
const si = require('systeminformation');
const servers = require('../servers.json')

// Calculate metrics.
// TASK 1:
class Agent
{
    memoryLoad()
    {
        return ((os.totalmem()-os.freemem())/os.totalmem()*100.0).toFixed(2);
    }
    async cpu()
    {
       let load = await si.currentLoad();
       return load.currentload.toFixed(2);
    }
    async cpuspeed()
    {
        let cps = await si.cpuCurrentspeed();
        return cps.avg.toFixed(2);
    }
}

(async () => 
{
    main(process.argv[2]);
})();


async function main(name)
{
    let agent = new Agent();
    let monitor_ip = servers.monitor; 
    let connection = redis.createClient(6379, monitor_ip, {})
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
            cpuspeed: await agent.cpuspeed()
        };
        let msg = JSON.stringify(payload);
        await client.publish(name, msg);
        console.log(`${name} ${msg}`);
    }, 1000);
}
