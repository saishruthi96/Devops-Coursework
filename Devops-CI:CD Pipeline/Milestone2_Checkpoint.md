# Milestone 2 - Checkpoint Report

---

## Team Members

| Name  | Unity Id |
| ------------- | ------------- |
| Sai Shruthi Kara | skara2  |
| Amitha Raghava Raju  | araghav4  |
| Atul Sharma  | asharm37 |

-------------------

## Checkpoint 1 Report
![](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/resources/Checkpoint2-M2.png)

### Tasks Completed
#### Automatically configure a build environment and build job (iTrust)
<ul>
  <li> Installed mysql, tomcat,maven and google chrome for iTrust build environment.</li>
  <li>Pipeline setup command now works with taking git credentials. </li>
  <li>Added git credentials to jenkins</li>
  <li>Basic itrust build job created and it runs successfully with the 'pipeline build itrust' command</li>
</ul>

#### Implement a static analysis for checkbox.io
* Completed the static analysis coding by enforcing the following metrics.
  * Long method
  * Message Chains
  * MaxNestingDepth

### Tasks to be Completed
<ul>
  <li>Plugins for code coverage as a part of iTrust build job and the threshold limits to be set.</li>
  <li>Implementing a test suite analysis for detecting useful tests</li>  
  <li>Overall testing of the static analysis task</li>
  <li>Screencast</li>
  <li>M2 branch capturing snapshot of milestone 2 work</li>
  <li>Code commit to Master branch</li>
  <li>Documenting Milestone 2 experiences</li>
</ul>

## Checkpoint 2 Report

![](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-22/blob/master/resources/Milestone2_board.PNG)

### Tasks Completed
#### Automatically configure a build environment and build job (iTrust)
<ul>
  <li> Included the Jacoco and Warnings Next Generation plugins for code coverage and static analysis report.</li>
  <li> Completed the tear down phase cleaning all the remaining processes.</li>
</ul>

#### Implement a test suite analysis for detecting useful tests
<ul>
  <li> Created the fuzzer with all the necessary fuzzing operations.</li>
  <li> Included the algorithm for randomly picking a source file and fuzzing with randome subset of operations.</li>
  <li> Executed the code for 1000 iterations and generated a report.</li>
</ul>


