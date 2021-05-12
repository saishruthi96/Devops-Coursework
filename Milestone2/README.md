## DevOps-Project

DevOps project Spring 2021 NC State University

--------------

## Team Members

| Name  | Unity Id |
| ------------- | ------------- |
| Sai Shruthi Kara | skara2  |
| Amitha Raghava Raju  | araghav4  |
| Atul Sharma  | asharm37 |

-------------------

### Links to Important Resources
* Link to Milestone 2 report can be found [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/README.md#milestone-2-report) 
* Link to Milestone 1 report can be found [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/README.md#milestone-1-report)
* Link to Milestone 1 checkpoints report can be found [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/Milestone1_checkpoint.md).
* Link to Milestone 2 checkpoints report can be found [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/Checkpoint.md).

## Execution Instructions

Steps to Execute:
Here are the steps to build the pipeline and trigger the build job

1. Clone the repository

2. Install node modules <br/>
  `npm install`

3. Create global symlink for dependency <br/>
  `npm link`

4. Running on windows then needs to transform files <br/>
`dos2unix cm\run-ansible.sh` <br/>
`dos2unix cm\server-init.sh` <br/>

5. Create the .vault-pass file
    - Navigate to ~\DEVOPS-22 folder
    - create file .vault-pass
    - Store the password
  
6. Build the pipeline <br/>
  `pipeline setup --gh-user <username> --gh-pass <password> `

7. Trigger the build job <br/>
  `pipeline build (checkbox.io|iTrust)` <br/>
    (or) <br/>
  ` pipeline build (checkbox.io|iTrust) -u <user-name> -p <password>` <br/>
 
8. Pipeline stage view <br/>
    - Navigate to http://192.168.33.20:9000/ <br/>
    - Login into Jenkins using the appropriate credentials. <br/>
    - open the appropriate job (checkbox.io|iTrust) - to observe the successful execution of job and the reports that are published. <br/>
9. Useful Tests <br/>
   `pipeline useful-tests -c 1000 --gh-user <username> --gh-pass <password>` <br/>
   This will show you the mutation coverage report.<br/>

## Milestone 1 Report

#### Screencast Link: [screencast](https://drive.google.com/file/d/1MjlQgts9WRNOukE9Tt7_gmWrfYXHcM47/view?usp=sharing)
#### Proof of Execution
* Link to Pipeline 4 (Source, Build, Test, Tear-down) Stage view [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/final-stable/resources/Stage_View.PNG)
* Link to BuildJob log file [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/resources/build_output.pdf)

### 1. Build Report
#### Task 1 - Automatically configure a jenkins server

- In this task we made use of the ansible notebook and plugins listed below to configure the Jenkins server

- Plugins used are listed within the file: cm\roles\jenkins\tasks\main.yml
   1. Install build pipeline plugin : `build-pipeline-plugin`
   2. Install Git : `git`
   3. Install workspace cleanup plugin : `ws-cleanup`
   4. Install workflow aggregator plugin : `workflow-aggregator`
   5. Install cloudbees credentials plugin : `cloudbees-credentials`
   6. Install credentials binding plugin : `credentials-binding`
   7. Install pipeline stage view plugin : `pipeline-stage-view`
- For successfully installation of the plugins, a retry property of 15 and delay of 10 was introduced in the ansible task.

- We made use of the Groovy script to turn off the initial jenkins setup wizard and automatically create user authentication. Moreover Jenkins server restart task was included inorder to enable the changes.

#### Task 2 - Automatically configure a build environment

Build environment created for node.js web application and checkbox.io. There was a dependency of the checkbox.io on node, nginx and mongodb. We created separate ansible roles and installed.

* Node - we selected Node JS version 14.x (latest available of 14.x)
* Nginx - Latest available Nginx version 1.18.0 (ubuntu)
* MongoDB - we selected MongoDB version 4.2

Post installing the dependencies created a mongo user/password and readWrite permissions. With the help of ansible-vault, secured the password in vars/vars.yml.

mongo_db: <user-name>
mongo_user: <user>
app_port: 3002
mongo_port: 27017
  
jenkins_port: 9000
jenkins_url: http://192.168.33.20:9000



#### Task 3 - Create a build job

* We made use of jenkins-job-builder to create or delete build job .
* To execute privilege commands, jenkins needs to have sudouser permission. To make this happen, we added user to sudoers file as jendkins ALL =(ALL) NPASSWD:ALL .
* Prior to installing jenkins, we need to make sure environment variables MONGO_USER and MONGO_PASSWORD are set. If in case we miss, database connection will fail during the npm test.

### 2. Experiences and Challenges faced
**Automatically configure a jenkins server**
 
- The first major problem we have faced is getting the jenkins up and running. That used to fail after several tries. The root cause was that we were restarting the jenkins frequently throughout the script. Reducing the restarts, resolved this issue.
- We have faced a "Cannot get CSRF" error while installing the jenkins plugins. There we realised that, we are not waiting for jenkins to come up after restarting due to which we were facing this issue. This [link](https://stackoverflow.com/questions/42219781/gets-error-cannot-get-csrf-when-trying-to-install-jenkins-plugin-using-ansible) helped us a lot. We have learnt how to handle the service through these errors.
- Encountered issue while running VirtualBox VMs on windows machine when Hyper-V is enabled. To fix the issues we ran the following command <code>bcdedit /set hypervisorlaunchtype off</code> with administration privileges and reset the machine.</li>
  <li> Incorrect naming of the environmental variables resulted in HTTP 401 error while installing the plugins in jenkins. We have taken good care of this from then on!
- It was important to choose the right java repository which has the release certificate. We have faced a lot of trouble trying to fix that and wasted a lot of time which could have been done in seconds with right one. This [resource](https://itsfoss.com/repository-does-not-have-release-file-error-ubuntu/)  helped us.
- As a newbies to Ansible, we always faced the indentation issue which got better eventually.

**Automatically configure a build environment (checkbox.io)**

<ul>
  <li> We had - "needs python-minimal but it is not installable" issue while installing nodejs. If we manually give the repo link by mentioning the version of node and the ansible-distribution release, it was not working. So, we have decided to use:
    
  ```
    deb https://deb.nodesource.com/node_14.x {{ ansible_distribution_release }} main""  </li>
  ```
  But, we were facing an error with the variable undefined. This is because Gather Facts was turned off. When we made turned it on, nodejs was installed smoothly.  </li>
  <li>Encoutered <code>bash: /bakerx/cm/server-init.sh: /bin/bash^M: bad interpreter: No such file or directory issue </code> while running on the windows machine. We were able to rectify the issue by converting windows files into Unix compatible ones by running the following commands: <code> dos2unix run-ansible.sh</code> and <code> dos2unix server-init.sh </code> </li>
</ul>

**Create a build job for jenkins**

<ul>
  <li>We have made the script ready for running the pipeline style job. But, we were getting an unauthorized error, followed by internal errors etc. This is because the plugins were not installed properly. We fixed this immediately. This happened because we were just using a list of pluggins and not looping through them. </li>
  <li>Faced a MongoServer SelectionError when trying to run the build command multiple times. This happened due to using 'restarted' state of systemd for MongoDb in the ansible script instead of 'started'.</li>
</ul> 

**Copying .vault-pass file to VM**

<ul>
  <li>We were facing issue in placing .vault-pass file to VM /home/vagrant/ directory. Was getting error - "Problem running vault password script /bakerx/cm/vars/.vault-pass (Error 8). If this not a script, remove executable bit from the file". 
    This was fixed by using "scpSync command to copy .vault-pass file from cm/vars/ to /home/vagrant/ in setup.js" and changing permission "chmod 0600 .vault-pass" in host. </li>
  </ul>

**NPM Unlink and Link**

<ul>
  <li>To reinstall npm, mistankenly did npm unlink which un did the effect of npm link and unlinked the symlinks. I was getting an error while running "pipeline setup" command, "pipeline is not recognized as an external or internal command". After npm install and npm link, rebooting laptop fixed the problem. </li>
</ul>

**Chmod can not access server-init.sh: No such file or directory**

<ul>
  <li>Were running pipeline setup command in /DEVOPS-22/cm/ directory and getting this error. Fix was to use this command in /DEVOPS-22 directory.</li>
</ul>



## Milestone 2 Report

#### Screencast Link: [screencast](https://drive.google.com/file/d/1ibG_1l4Uy-2QW_8VE64ecweF4IkSyJ9d/view?usp=sharing)
#### Proof of Execution
**1000 iterations report** - [1000 iterations](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/1000_iterations_full_output.txt)<br/>

**Snapshot of mutations directory :** [Mutation Files](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/resources/Mutations_directory.png)<br/>


### 1. Build Report
#### Task 1 - Automatically configure a build environment and build job (iTrust)
Implemented all the pre-requisite steps for iTrust job:
<ul>
  <li>Installed mysql and tomcat </li>
  <li> Created developer token for cloning purposes instead of git password usage</li>
  <li> Git credential setup in command files and adding them to jenkins through crumb request.</li>
  <li> Configured the application.yml before hand and made sure that the credentials are not exposed.</li>
  <li>Created jenkins job with all the necessary phases.</li>
  <li>Installed jacoco and  Warnings Next Generation plugins.</li>
  <li>Configured jacoco for code coverage and Warnings Next Generation plugin for analysis reports as a part of build job.</li>
</ul>

#### Task 2 - Implement a test suite analysis for detecting useful tests
#### Fuzzer
Implemented the Fuzzer by modifying 10% source lines of 1 random source file each iteration and considered the following operations for mutation:
<ul>
  <li>swap "==" with "!="</li>
  <li>swap 0 with 1</li>
  <li>change content of "strings" in code.</li>
  <li>swap "<" with ">" - excluding Generics</li>
  <li>swap "&&" with "||"</li>
  <li>swap "true" with "false"</li>
</ul>
* Strategy to apply subset of operations while mutating the source file:
 - Mandatory Operations:
    * swap "==" with "!="
    * Random String replacement.
 - 70% Probability
    * swap 0 with 1
    * swap "&&" with "||"
 - 30% Probability
    * swap "<" with ">" - excluding Generics
    * swap "true" with "false 
 
#### Prioritization
Ordered from most useful to least useful, based on the number of times the test has detected a failed build.
#### Mutation coverage report
Generated the mutation coverage report for 1000 iterations (Text file included in the repository).

#### Task 3 - Implement a static analysis for checkbox.io
* Implement a static analysis using esprima and visitor patterns to calculate the following metrics.
    * Long method: Detect long methods (>100 LOC).
    * Message Chains: Detect message chains (for .) (> 10 chains)
    * MaxNestingDepth: Count max depth of if statements in a function (> 5)

- The analysis was run on all the javascript files from [checkbox.io](https://github.com/chrisparnin/checkbox.io/tree/master/server-side) repository.
- The following violation were encountered:

```
server-side/site/test/complexity/longmethod.js [ longMethod (LOC: 172)]
server-side/site/test/complexity/nestedchains.js [MaxMessageChain : (Chain Length: 11)]
server-side/site/test/complexity/nestedifs.js [ (Nesting Depth: 6)]
server-side/site/marqdown.js [ ProcessTokens (LOC: 233)]
```

- The build.log for the static analysis phase is available [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/checkbox.io_build-log.pdf).

--------------------

### 2. Experiences and Challenges faced
**Automatically configure a build environment and build job (iTrust)** 
<ul>
  <li> Faced an issue of exit code 137 while running the mvn test command and realized that it is a memory outage issue. We could resolve the issue by maintaining a minimum memory of 4GB (4096MB) which made all the automation tasks smooth and the job was running with good speed.</li>
  <li>While doing the tomcat installation, after downloading and extracing the archive, we were not moving into the extracted directory and were trying to perform configuration operations outside that directory. This resulted in status=200/CHDIR issue. The issue got resolved once we moved into the appropriate tomcat directory. </li> 
  <li>Encountered build failure due to starting the tomcat ahead of running mvn clean test and also problems with mysql installation. Jenkins job succeeded after fixing them. </li>
  <li>We were able to login to mysql with any password. This is because we had the --skip-grant-tables enabled and this lets us login to the server as root and allows us to set a fresh password everytime. Removed it. <a href="https://unix.stackexchange.com/questions/385202/mariadb-accepts-any-password">Reference</a></li> 
</ul>

**Implement a test suite analysis for detecting useful tests**
<ul>
  <li> When we implemented the fuzzing operation, we could see that the builds were passing all the time. So, this happens because the application.yml file was not being included and the application failed to load. But, in the customized function where we were getting the status check, the function looks for the failure property and if it is not there, then it considers the testsuite as passed. But, in our case, it was an error not a failure. So, it was marking it as pass which was wrong. Hence, when the config file was setup, the correct results were obtained.</li>
</ul>
<ul>
  <l1> When tried to run useful-tests, got error regarding home/vagrant/mutator_driver.js not found. Issue was fixed when tried to change order in playbook.yml roles.</li>
 </ul>

**Implement a static analysis for checkbox.io**
* While implementing the MaxNestingDepth: Considered node.consequent and node.alternative, in certain situations encountered 1 higher nesting depth.
* During the implementation of MaxMessageChain feature considered variable delecaration along with MemberExpression was attaining errorneous value.

----------------------
