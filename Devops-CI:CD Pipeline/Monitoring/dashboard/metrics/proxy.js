// websocket server that dashboard connects to.
const chalk = require('chalk');
const redis = require('redis');
const got = require('got');
const fs = require('fs');
const http = require('http');
const httpProxy = require('http-proxy');
var child  = require('child_process'); 
// SWITCH OVER TIME OF 1 MINUTE
const shift_timeout = 60000;
//LOAD TIME OF 1 SECOND
const load_time = 1000;

// Our arrays for metrics for final report generation
var cpuList = [];
var memoryList = [];
var latencyList = [];
var statusCodeList = [];
var serverName;


// Get the two server IP addresses through command line arguments

let args = process.argv.slice(2);

const BLUE_SERVER_URL = `http://${args[1]}:3000/preview`;
const GREEN_SERVER_URL = `http://${args[2]}:3000/preview`;

var	servers = 
	[
	{name: "blue", url:`http://${args[1]}:3000/preview`, status: "#cccccc",  scoreTrend : [0]},
	{name: "green", url:`http://${args[2]}:3000/preview`, status: "#cccccc",  scoreTrend : [0]}
	];

async function saveMetrics() 
{
	const data = {
		name : serverName,
		cpu: cpuList,
		memory: memoryList,	
		latency: latencyList,
		statusCode: statusCodeList
	};
	 
	await fs.writeFileSync(`/home/vagrant/${data.name}.json`, JSON.stringify(data), 'utf8');

	serverName = '';
	memoryList = [];
	cpuList = [];
	latencyList = [];	
	statusCodeList = [];
}

////////////////////////////////////////////////////////////////////////////////////////
// PROXY / LOAD BALANCER
////////////////////////////////////////////////////////////////////////////////////////
// For the First 5 minutes it routes traffic to BLUE_SERVER_URL
// For the next 5 minutes it routes traffic to GREEN_SERVER_URL
// Finally it terminates the servers using `pm2 kill`
class Proxy
{
    constructor()
    {
		this.TARGET = BLUE_SERVER_URL;
		setInterval(this.pushServerLoad.bind(this), load_time);
		setTimeout( this.switchover.bind(this), shift_timeout );
    }

    async proxy()
    {
        let options = {};
        let proxy   = httpProxy.createProxyServer(options);
        let self = this;
        // Redirect requests to the active TARGET (BLUE_SERVER_URL or GREEN_SERVER_URL)
        let server  = http.createServer(function(req, res)
        {
            // callback for redirecting requests.
            proxy.web( req, res, {target: self.TARGET } );
        });
		server.listen(3080);	
   }

   async switchover()
   {
	  await saveMetrics();
      this.TARGET = GREEN_SERVER_URL;
	  console.log(chalk.keyword('pink')(`Switching over to ${this.TARGET} ...`));
	  setTimeout(async function() {
		await saveMetrics();
		child.execSync('pm2 kill', {stdio: 'inherit'});
	}, shift_timeout); 
   } 
   
   // We send Load to our target every 5 seconds
   // We use POST method on /preview service at port 3000
   // We will survey.json to be rendered
   async pushServerLoad() {
       
            var options = {
                headers: {
                    'Content-type': 'application/json'
                },
                body: fs.readFileSync('/home/vagrant/dashboard/survey.json', 'utf8'),
				throwHttpErrors: false,
				timeout: 5000
			};
			let now = Date.now();
			var channel = this.TARGET;
			try {
            got.post(this.TARGET, options).then(function(res){
                for (var server of servers) {
					let currentServer = server;
					if (currentServer.url == channel) {						
						currentServer.statusCode = res.statusCode;
						currentServer.latency = res.statusCode != 200 ? 5000: Date.now() - now;
						updateHealth(currentServer);
					}
				}
			})
		}
		catch(e) {}
	}
}


/************************************
 * BEGIN THE MONITORING AND METRICS
*************************************/
function start(app)
{
	////////////////////////////////////////////////////////////////////////////////////////
	// DASHBOARD
	////////////////////////////////////////////////////////////////////////////////////////
	const io = require('socket.io')(3000);
	// Force websocket protocol, otherwise some browsers may try polling.
	io.set('transports', ['websocket']);
	// Whenever a new page/client opens a dashboard, we handle the request for the new socket.
	io.on('connection', function (socket) {
        // console.log(`Received connection id ${socket.id} connected ${socket.connected}`);

		if( socket.connected )
		{
			//// Broadcast heartbeat event over websockets ever 1 second
			var heartbeatTimer = setInterval( function () 
			{
				socket.emit("heartbeat", servers);
			}, 1000);

			//// If a client disconnects, we will stop sending events for them.
			socket.on('disconnect', function (reason) {
				console.log(`closing connection ${reason}`);
				clearInterval(heartbeatTimer);
			});
		}
	});

	/////////////////////////////////////////////////////////////////////////////////////////
	// REDIS SUBSCRIPTION
	/////////////////////////////////////////////////////////////////////////////////////////
	let client = redis.createClient(6379, 'localhost', {});
	// We subscribe to all the data being published by the server's metric agent.
	for( var server of servers )
	{
		// The name of the server is the name of the channel to recent published events on redis.
		client.subscribe(server.name);
	}

	// When an agent has published information to a channel, we will receive notification here.
	client.on("message", function (channel, message) 
	{
		// console.log(`Received message from agent: ${channel}`)
		for( var server of servers )
		{
			// Update our current snapshot for a server's metrics.
			if( server.name == channel)
			{
				let payload = JSON.parse(message);
				server.memoryLoad = payload.memoryLoad;
				server.cpu = payload.cpu;					
			}
		}
	});

	let proxy = new Proxy();
	proxy.proxy();
}


function computeMetricFactor(serverEntity, low, medium, high) {
	var tempScore = 0;
	if(serverEntity  < low) {
		tempScore = 1;
	} else if(serverEntity < medium) {
		tempScore = 0.75;
	} else if(serverEntity < high) {
		tempScore = 0.5;
	}
	return tempScore;
}

async function updateHealth(server)
{
	let score = 0;
	if (server.statusCode == 200) {

		score += 1
		score += computeMetricFactor(server.latency, 50, 100, 2000);
		score += computeMetricFactor(server.memoryLoad, 75, 90, 100);
		score += computeMetricFactor(server.cpu, 50, 75, 100);		
	}

	latencyList.push(server.latency);
	memoryList.push(server.memoryLoad);
	cpuList.push(server.cpu);		
	statusCodeList.push(server.statusCode);
	serverName = server.name;

	server.status = score2color(score/4);	
	// Add score to trend data.
	server.scoreTrend.push( (4-score));
	if( server.scoreTrend.length > 100 )
	{
		server.scoreTrend.shift();
	}
}

function score2color(score)
{
	if (score <= 0.25) return "#ff0000";
	if (score <= 0.50) return "#ffcc00";
	if (score <= 0.75) return "#00cc00";
	return "#00ff00";
}
module.exports.start = start;