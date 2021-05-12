## Class activities 
 **Discussion: Describe a situation where it was difficult to run code from someone else**<br/><br/>
 <img src = "Images/HW1_Discussion.png" width =800 height = 400/><br/>
 I have joined the ams2 voice channel for a discussion about difficulty in running other's code on 2nd February, 2020 at 8:00 P.M. It was very useful discussion and I got to know different stories of how people faced the trouble and the way they resolved it. It was fun to share my story of running a machine learning project in Python as a beginner.<br/><br/>

**Complete "On your own": Ubuntu up script**<br/>
Script code<br/><br/>
<img src = "Images/upscript.png" width =800 height = 400/><br/><br/>
Triggered the script to prepare the VM and install the necessary softwares, cloning the repo and installing the required packages. Script file uploaded into the repo - "up.sh".<br/><br/>
<img src = "Images/oyo_1.png" width =800 height = 400/><br/><br/>
<b>Inside your ubuntu VM, run cd App; node main.js start 9000</b><br/><br/>
<img src = "Images/oyo_2.png" width =800 height = 400/><br/><br/>
<b>Check that you can visit your app on the ubuntu machine, by visiting http://localhost:8089.</b><br/><br/>
<img src = "Images/oyo_output.png" width =800 height = 400/><br/><br/>

**Extra Feature - 1**<br/>
**Adding a bridge network or host-only network in ubuntu**<br/>
Code:<br/>
<img src = "Images/ef-1-script.png" width =800 height = 400/><br/><br/>
Preparing the VM<br/>
<img src = "Images/vmworkshop_EF-1-1.png" width =800 height = 400/><br/><br/>
Updated the 52-bridge.yaml file<br/>
<img src = "Images/vmworkshop_EF-1-2.png" width =800 height = 400/><br/><br/>
**updated network configuration**<br/>
<img src = "Images/vmworkshop_EF-1-3.png" width =800 height = 400/><br/><br/>

**Complete the CLI notebook** <br/><br/>
Code file named "cli.js" has been uploaded. <br/>
**Code:**<br/><br/>
<img src = "Images/cli_code.png" width =400 height = 800/><br/><br/>

<b>Intial execution of the program:</b><br/>
<img src = "Images/CLI-2.png" width =800 height = 400/><br/><br/>
<b>Modified program to meet the mentioned requirements:</b><br/><br/>
<img src = "Images/CLI-1.png" width =800 height = 400/><br/><br/>

**Complete Docker workshop**<br/><br/>
**Part 1 - A Simple Container**<br/><br/>
<b>Pull an 3.9 alpine image and create a VM called, containers</b><br/>
<img src = "Images/docker_container_intro.png" width =800 height = 400/><br/>
**Prepare a simple rootfs with busybox.**<br/>
<img src = "Images/docker_part1-1.png" width =800 height = 400/><br/>
<img src = "Images/docker_part1-2.png" width =800 height = 400/><br/>
<img src = "Images/docker_part1-3.png" width =800 height = 400/><br/>

From the Part 1 of the workshop, I got to know how to set up the minimal linux environment using binaries from the busybox distribution. I have installed the simlinks and tested the container within chroot. The practical usage of the concept 'chroot' discussed in the virtualization concepts lecture is covered here. But, we can see that the complete isolation of the file system is not achieved.<br/> 

**Part 2 - Introducing overlay filesystem**<br/><br/>
<img src = "Images/docker_part2-1.png" width =800 height = 400/><br/>
In the Part 2 of the workshop, we can see that the original rootfs is intact. Each container instance has got its own file system - "Isolation Achieved".<br/><br/>
<b> Including 'proc'</b> <br/>
<img src = "Images/docker_part2-2.png" width =800 height = 400/><br/>
<img src = "Images/docker_part2-3.png" width =800 height = 400/><br/><br/>

 But, with proc being introduced, we can see that we had more privileges than necessary that resulted in killing our own container and also leading to a possibility of deleting other's containers as well. This might be dangerous.<br/><br/>
**Part 3 - Introducing Docker containers** <br/><br/> 
<b>Setting Up - Docker</b><br/><br/>
Done with the installation of the docker as instructed and removed the need to sudo. Pulled the helloworld image as well.<br/>
<img src = "Images/docker_setup-1.png" width =800 height = 400/><br/>
<img src = "Images/docker_setup-2.png" width =800 height = 400/><br/>
<img src = "Images/docker_setup-3.png" width =800 height = 400/><br/><br/>
<b> Playing with Docker</b><br/>
 <img src = "Images/docker_play-1.png" width =800 height = 400/><br/>
 <img src = "Images/docker_play-2.png" width =800 height = 400/><br/><br/>
 As we can see, even though we removed everything with rm command, the moment we have requested the new container , everything is intact. This shows the immutable property- The image in the container is read-only.<br/><br/>
 
 <b>Building Images</b><br/><br/>
 Created my own docker image 'java11' and checked the environment setup.<br/>
 <img src = "Images/docker - containers -1.png" width =800 height = 400/><br/><br/>
 
 <b>Understanding containers</b><br/>
 Glance at all the containers I have created.<br/> 
  <img src = "Images/docker - containers -2.png" width =800 height = 400/><br/><br/>
  
  Creating and commiting a file to the image<br/><br/>
  <img src = "Images/docker - containers -3.png" width =800 height = 400/><br/><br/>
  We cans see that all the images do contains the file 'foo.txt' that we have commited.<br/>
<b> Volumes and Build Script </b><br/><br/>
<img src = "Images/docker - last part-1 .png" width =800 height = 400/><br/>
<img src = "Images/docker - last part -2 .png" width =800 height = 400/><br/><br/>
Used the concept of volumes here. Through this part of the workshop, performed the sharing of the file system of host with the container and got to know an easy hatch to get in and out of the container. Also, we can see that the build script fails due to the version issues. <br/><br/>

## Conceptual Questions
**i. Why can code be difficult to run on another machine?**<br/>
Ans.) The following are few reasons as to why it can be difficult to execute our code on another machine:<br/>
<ul>
  <li> The configurations of the environments might be different. </li>
  <li> Dependent Libraries not installed on the target PC.</li> 
  <li> The target PC not having the right version of the software that is being used.</li>
  <li> Hardcoding in the code. For example, hardcoded directory path in the code.
</ul>

**ii. Explain the concepts of a computing environment and headless infrastructure.**<br/>
Ans.) **Computing Environment**<br/>
A computing environment is nothing but collection of different softwares, networks, storage devices,virtual machines etc. that help us to successfully accomplish the task or building the software product. One famous type of the computing environment is Personal Computing environment - Laptops etc..We all have faced the famous problem of " It works on my machine". We can solve this problem with the thought process of considering the computing environment to be co-existing along with the code (not just considering the code as an isolated one). In this way be build a resilient,scable software. But, as a matter of fact, we should also be vigilant that the computing environment might be effected by the external changes like time, load etc. The availability of computer resources within the environment will impact the performance of the product we build. We need to keep upgrading it as time wears things down.<br/><br/>

**Headless Infrastructure**<br/>
The whole concept of the Headless infrastructure comes from the motive that we would like to provision a VM, boot in seconds, use it and discard it right away without making it a time consuming process. It will not have GUI to access but we will just emulate the inner workings - have the base setup of the virtual machines running and make sure it is sufficient to get our task done. For example, provisioning a 2GB Mac OS that can host a web server etc. This makes the setup much more light weighted and we will have experience which is almost similar to the cloud. <br/>

**iii. Compare full emulation virtualization vs. binary translation**<br/>
Ans.) The following are the differences between Full Emulation virtualization and binary translation:<br/>
<ul> Full Emulation virtualization handles the privileged instructions very easily, while binary translation will do the just-in-time translation by converting unsafe instructions to safe one so that it can make it easy for the VMM to execute, which has its own overheads.</li>
<li> Full emulation virtualization provides complete isolation from the host OS which is not the case with binary translation. </li>
<li> Full emulation virtualization doesn't take the advantage of the optimizations resulting in the inefficient performance while binary translation provides better performance by avoiding the execution of repeated instructions.</li>
<li> Memory utilization costs are more in binary translation due to the storing of code cache to avoid repeated instructions which is not the case with full emulation virtualization.</li>  
</ul>

**iv.What are some use cases associated with microvms and unikernels?**<br/>
Ans.)Use cases of microvms:<br/>
<ul>
<li>They can be used in embedded applications such as Docker for Mac or Windows subsystem Linux.</li>
<li> Ideal for cloud-native applications that require only few hardware. devices.</li>
 <li> The concept behind Amazon Firecracker - providing enhanced security and workload isolation , while taking into account, the speed and resource efficiency of containers.</li>
</ul>
Use cases of unikernels:<br/>
They are used mostly in large infrastructures or in specialized use cases like:<br/>
<ul>
 <li>Cloud apps - to deploy apps on cloud</li>
 <li>IoT devices - Facilitates everything needed to deploy software for IOT</li>
 <li>On-demand computing - They are ideal for on-demenad computing due to the minimal time taken by them to boot etc.</li>
</ul>

**v.In VM workshop, why can't the eth0 ip address be pinged from the host?**<br/>
Ans.) The ping to the eth0 ip address failed because the network is private to the virtual machine. The only way the VM can reach external sites is through the Network Address Translation(NAT) but it cannot be a target for actions like web server etc. To make this work, the VM should share the network with host through several options like having bridge networking etc.<br/><br/>

**vi.How can bakerx access the virtual machine through ssh?** <br/>
Ans.)Bakerx will intially collect the info like name, provider, user, identity .Then it will try to locate the port of the VM and extract the image info. Private key(present in the Identity File path) which is generated for ssh login plays a most important role in accessing the VM.  With all the info, it assembles the following ssh command and establishes the access. <br/>

```
sshCmd = `ssh -q -i "${sshConfig.privateKey}" -p ${sshConfig.port} -o StrictHostKeyChecking=no ${sshConfig.sshUser}@${sshConfig.hostname}`;
```

**vii.What are the limitations of using chroot for os-virtualization?**<br/>
Ans.) The limitations of chroot for os-virtualization:<br/>
<ul>
 <li>There will be no limit on memory/CPU that will be allocated.</li>
 <li> There will be a lot of security issues</li>
 <li>Cannot use the smae network port as another process</li>
 <li>Visibility of other running process will be there.</li>
</ul>

**viii.Why is the builder pattern useful for building images?**<br/>
Ans.)With the builder pattern,we have one Dockerfile for development purpose to install all the necessary dev tools and a production version, which only contains elements needed to run the container. So, essentially we are throwing away all the old layers and retaining only the bottom layer and using it to create a smaller image. This pattern helps us to creater images that are space efficient which can be shipped to production easily and also avoids the large surface area of the image which might be prone to attacks.<br/><br/>

**References Used** <br/>
https://github.com/ottomatica/node-virtualbox/blob/master/lib/VBoxProvider.js#L173 <br/>
https://github.com/ottomatica/bakerx/blob/master/lib/commands/ssh.js<br/>
https://medium.com/ci-t/set-up-a-virtualbox-vm-with-4-vboxmanage-commands-9266a5ee885d <br/><br/><br/>


# Virtual Machine provisioning with CLI program
[Screencast Link](https://drive.google.com/file/d/1Bfe3zf8Dju6xoLoNLMWRel6qKDyIfHTV/view?usp=sharing)
