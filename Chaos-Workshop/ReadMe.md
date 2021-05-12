<h1> Chaos Workshop</h1>

## Dashboard (Traffic Visualization)
We can visualize the effects of traffic on the metrics by running the command:

```
siege -b -t30s http://192.168.44.102:3080/stackless
```
The outcome is as follows:

<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/Chaos-1.png" width =600 height =400/>

## Experimentation

### Burning up the CPU of a single docker container.
#### Adding chaos
Enter the green canary server (bakerx ssh greencanary). Then, let's open up a shell within one of the docker containers:

`docker exec -it app1 sh `

Adding the CPU Chaos as follows:

```
vi chaos_cpu.sh
chmod +x chaos_cpu.sh
./chaos_cpu.sh
```

The CPU Script is as follows:

```
#!/bin/sh
# Script for CPU  Chaos

cat << EOF > /tmp/infiniteburn.sh
#!/bin/bash
while true;
    do openssl speed;
done
EOF

# Make executable
chmod +x /tmp/infiniteburn.sh

#Will cause a ton of chaos! 
for i in $(seq 1 32);
do
    nohup /bin/sh /tmp/infiniteburn.sh &
done
```

#### Observations
Run the following:

```
siege -b -t30s http://192.168.66.108:3080/stackless
siege -b -t30s http://192.168.44.102:3080/stackless
```

**What did we see??**
We see a large increase in latency in green canary server, meaning client requests are taking much longer (and may be timing out) <br/>

<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/Chaos-cpu.png" width =600 height =400/>

**What have we learnt??**

We can that there is a significant latency on the green canary in processing the requests. This means that the round-robin load balancer is ignoring the CPU load on the green canary and is overloading it with requests. The implication is that we should be mindful of avoiding routing to overloaded instances, which can increase quality of service.

### Network traffic

Inside bakerx ssh greencanary, run the following command:

`sudo tc qdisc add dev enp0s8 root netem corrupt 50%`

Then induce the load on the greeen canary like this:

`siege -b -t30s http://192.168.66.108:3080/stackless`

**What did we see??**
We can see clear spikes in the latency of the green canary.<br/>

<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/chaos-network.png" width =600 height =400/>

**What have we learnt??**

This spike is because we are messing up with the TCP. The connection will attempt to retransmit the lost or corrupt packets resulting in increase in the CPU load to process the requests (which is very slow) thereby creating latency.<br/><br/>
Once done, reset the connection with:

` /bakerx/chaos_reset.sh `

## Killing and starting containers

Stop the docker conatiners as follows:

`docker stop app1 app2`

Now, induce the load onto the canaries.

**What did we see??**

<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/Chaos-kill.png" width =600 height =400/>

The seige results for blue canary are as follows:<br/>
<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/siege-blue.png" width =600 height =400/><br/>

The seige results for green canary are as follows:<br/>
<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/siege-green.png" width =600 height =400/><br/>

**What have we learnt??**

The latency of the green canary is significantly less than that of the blue canary. This is kind of surprising because, we expect it to be more than the control canary due to the very fact that the single container should take care of the load that the load balancer is distributing. But, this is not the case as seen in the results. This might be because due to the following reasons:
<ul><li>Since there are three containers in blue canary and there will be some overhead associated with routing of traffic among them which might be causing the spike. Also, we have to consider the very fact that there is 100% availability of the blue canary from the seige results. </li>
<li>Also, from the seige results of the green canary, we can see that the successful transactions are 705 whereas the failed transactions are 750, which means, that many transactions are dropped off without processing with status code of 500 thereby reducing the load as well as the latency.</li>
</ul>

## Squeeze Testing
Try limiting the available cpu and memory settings with running the container as follows:<br/>
<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/squeeze-terminal.png" width =600 height =400/><br/><br/>
**Notice anything interesting?**<br/>
<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/squeeze-1.png" width =600 height =400/><br/><br/>
<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/squeeze.png" width =600 height =400/><br/>
We can see that the cpu load and latency trend is similar and comparable between blue and green canaries. Surprisingly, even though we reduced the memory and cpu limits, the requests have been served successfully without any failed transactions in both the cases.<br/><br/>
## Filling disks
**1. Inside one of the containers (e.g., using docker exec -it app3 sh), add and run the command to fill the disk: ./fill_disk.sh /fill 2G.**<br/>

<img src="https://github.ncsu.edu/cscdevops-spring2021/chaos-skara2/blob/main/Images/Fill-disk.png" width =600 height =400/><br/>

**2. Try to create a file inside another container. What happened?**<br/><br/> 
Ans.)We are unable to create the file and not even sh into it as there is no space left on the disk<br/><br/>

**3. Kill the container and start it again.**<br/>
Ans.) Yes, we are able to create the the file now on another container.<br/><br/>

**What surprising fact did you learn?**<br/>
When we exhausted the space by running the fill_disk initially, we are unable to create file in another container and this is due to the fact that the containers share the memory of the device.

## Reflection
**How could you extend this workshop to collect more measures and devise an automated experiment to understand which event/failure causes the most problems?**<br/>
We can extend the workshop and include few more ideas like:<br/>

<ul>
    <li>Exhausting application APIs</li>
    <li>Exhausting the disk space on hard drives</li>
    <li>Blocking access to APIs from cloud instances......</li>    
</ul>
As we have done for Canary Analysis, we can collect the health metrics from these experiments and feed it to Withney-Utest to analyse the significance levels and conclude which events/metrics are paramount and stay vigilant and improve the system so that it is robust to such failures.<br/>
