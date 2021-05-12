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
* Link to Milestone 1 checkpoint 1 report can be found [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/Checkpoint.md).

#### Screencast Link: [screencast](https://drive.google.com/file/d/1MjlQgts9WRNOukE9Tt7_gmWrfYXHcM47/view?usp=sharing)
#### Proof of Execution
* Link to Pipeline 4 (Source, Build, Test, Tear-down) Stage view [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/final-stable/resources/Stage_View.PNG)
* Link to BuildJob log file [here](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/resources/build_output.pdf)

## Milestone 1 Report
### 1. Execution Instruction

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
    - Navigate to ~\DEVOPS-22\cm\vars folder
    - create file .vault-pass
    - Store the password
  
6. Build the pipeline <br/>
  `pipeline setup`

7. Trigger the build job <br/>
  `pipeline build checkbox.io` <br/>
    (or) <br/>
  ` pipeline build checkbox.io -u <user-name> -p <password>` <br/>
 
8. Pipeline stage view <br/>
    - Navigate to http://192.168.33.20:9000/ <br/>
    - Login into Jenkins using the appropriate credentials. <br/>
    - open /job/checkbox.io/ - to observe the successful execution of job and the npm testing. <br/>

### 2. Build Report
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

### 3. Experiences and Challenges faced
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
