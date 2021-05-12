# Screencast
Screen cast link :[link](https://drive.google.com/file/d/1aUKMywpe5aWEPNQZ6adec2x5mE5fDXqe/view?usp=sharing)
# Workshop
## Task 1
### Implement a day of week service
Modify the code to add a new route, /dayofweek that will return the current day of the week as a number. Hint: You can use new Date() to obtain an object with the current time.

```
curl -ss localhost:3003/dayofweek
```

<ins>Result: </ins> 1 (Monday)
Code Link: [Link](https://github.ncsu.edu/cscdevops-spring2021/HW5-skara2/blob/master/Caches/basics/routes/simple.js)

## Task 2 
### Self-destruct message service.
Created two routes, /tape and /read which implements the following:

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
Code Link: [Link](https://github.ncsu.edu/cscdevops-spring2021/HW5-skara2/blob/master/Caches/basics/routes/api.js)


## Task 3
### Cache best facts calculation

```
time ./meow.io/load-index.sh 
```
Modified meow.io/routes/index.js to cache and return the results of bestFacts and cache results will expire after 10 seconds. There is a significant reduction in load time and the results are as follows:
```
Without Caching
----
real    0m34.070s
user    0m2.415s
sys     0m1.222s

With Caching
-------
real    0m10.641s
user    0m2.361s
sys     0m1.331s
```


## Task 4 
### Cat picture uploads storage

```
time ./meow.io/load-and-vote-upload.sh
```
Modified the meow.io/routes/upload.js file to cache recently uploaded images in addition to writing to the database and also the meow.io/routes/index.js to read from the cache instead the database and the results obtained are as follows:

```
Before
----
real    0m40.198s
user    0m4.928s
sys     0m2.474s


After
-----

real    0m17.086s
user    0m4.928s
sys     0m2.805s
```


## Task 5
### Regulate uploads with queue
Modified the meow.io/routes/upload.js to store incoming images in a queue and not the database and meow.io/app.js to timer (setInternal every 100ms), to pop images stored in the queue (consider using LPOP ) and save in the database.

```
time ./meow.io/load-and-vote-upload.sh
```

There is an improvement when compared to Task 4 with the below outcome :

```
real    0m16.343s
user    0m4.900s
sys     0m2.861s
```

**Code Links for Tasks 3,4 & 5:**

Code Link: [index.js](https://github.ncsu.edu/cscdevops-spring2021/HW5-skara2/blob/master/meow.io/routes/index.js)

Code Link: [upload.js](https://github.ncsu.edu/cscdevops-spring2021/HW5-skara2/blob/master/meow.io/routes/upload.js)

Code Link: [app.js](https://github.ncsu.edu/cscdevops-spring2021/HW5-skara2/blob/master/meow.io/app.js)

# Conceptual Questions (20)
**1. Describe three desirable properties for infrastructure.**<br/>
Ans.)The three desirable properties for infrastructure are as follows:<br/>
<ul>
  <li><b>Availability:</b> The basic motto of availability is to provide the users with uninterrupted service with desirable zero downtime or if that is not possible then reducing the downtime to maximum of few seconds. </li>
  <li><b>Efficient:</b> This property aims at avoiding the repetitive works especially the expensive operations like continuously reading from the database. It proposes the shift of responsibility which means doing the same work in much cheaper way. May be using caches etc.</li>
  <li><b>Robust:</b> This means, the infrastructure should be able to respond to the failure in much graceful way. It should be able to provide limited service even though many things are not working instead of completely shutting down.</li>
</ul>


**2.Describe some benefits and issues related to using Load Balancers.**<br/>
Ans.)<br/>
<b>Benefits:</b><br/>
<ul>
<li>It has the sense of traffic and hence requests new instances as needed</li>
<li>It ensures availabilty and scalabililty</li>
<li>It allows us to better utilize resources</li>
</ul>
<b>Issues:</b><br/>
<ul>
  <li>If there are unequal number of servers and the TCP connections, then the distribution might be uneven causing issues.</li>
  <li>When there are multiple servers, a particular users information during a users session might get stored in different backend servers. This would lead to hampering of the users session. Hence, storing this info on one backend server is always recommended. So, the users must use stickiness and even the configuration of load balancers should be inclined to this.</li>
</ul>

**3.What are some reasons for keeping servers in seperate availability zones?**<br/>
Ans.) The following are some of the reasons for keeping servers in seperate availability zones:<br/>
<ul>
<li>It support isolation from other instances avoiding cascading failures </li>
<li>It ensures availability and robustness therby dealing with outages in a much better way</li>
<li>Plays crucial role in supporting certain deployment strategies like replication of servers when the other is down for maintenance</li>
</ul>

**4.Describe the Circuit Breaker and Bulkhead pattern.**<br/>
Ans.)**Circuit Breaker Pattern:**<br/>
* It is very helpful when there are huge infrastructures in distributed environments.
* It prevents the application from making repeated calls that are going to fail anyway. This pattern either waits for the error to be fixed or analyses if the fault is long existing or not, along with providing the mechanism to check if the issue is resolved or not. 
* It will act as a middle man to eliminate connections to faulty services.
* The idea is to include a function that monitors failures which when hits a threshold point, the circuit breaker trips and prevents anymore calls until the services are revived.<br/><br/>
**Bulkhead Pattern:**<br/>
* This is the type of application design that is tolerant to failure
* The components of an application are isolated in such a way that if one fails, the others will continue to function.
* This will avoid cascading failures through the load shredding.
<br/>
