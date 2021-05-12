# Milestone 3 - Checkpoint Report

---

## Team Members

| Name  | Unity Id |
| ------------- | ------------- |
| Sai Shruthi Kara | skara2  |
| Amitha Raghava Raju  | araghav4  |
| Atul Sharma  | asharm37 |

-------------------

## Checkpoint 1 Report
![](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/resources/m3_cp1_board.png)

### Tasks Completed
#### Provision cloud instances.
  * We have chosen AWS as our cloud service provider
  * Used Python for provisioning the EC2 instances.
  * Created the provisioning specific notebooks.
  * Created the prod.js file which provisions the VMs on AWS by executing all the necessary ansible tasks.
  
#### Deploy checkbox.io and iTrust
  * Created the respective notebooks for the deployment of checkbox.io and itrust.
  * Installed all the necessary softwares required for checkbox and itrust on the respective VMS ( Reused the roles from previous milestones).
  * Extended the jenkins job to create the war file for deployment of iTrust.
  * Successfully deployed the applications on the local development environment.
---------------------------  
#### Bonus: Monitoring Dashboard
 * monitor-setup command is ready to be used.
 * This command sets up the necessary softwares for the monitor dashboard code as well as the agent specific code to be executed successfully.
 * Brings up the basic dashboard for now to see the metrics.

### Tasks to be Completed
* Canary Analysis completely
* Work on the Dashboard to include few more metrics specific to checkbox and itrust
* Test the development on the cloud
* Create the screencast
* Check in the code to master
* Complete the documentation
* Create M3 branch and sync the code

--------------------------------------------------------------
## Checkpoint 2 Report
![](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/resources/milestone3_dashboard.PNG)

### Tasks Completed
* Completed the Canary Analysis task and made sure the canary command works for all the combinations of master and broken.
* Worked on the Dashboard to display the metrics published by the agents and also configured the /dashboard endpoint using NGINX
* Tested the development on the AWS cloud
* Create the screencast
* Check in the code to master
* Complete the documentation
* Create M3 branch and sync the code


