const fs = require("fs");
const child = require("child_process");
const chalk = require("chalk");
const path = require("path");
const os = require("os");
const scpSync = require("../lib/scp");
const sshSync = require("../lib/ssh");
var mwu = require('mann-whitney-utest');

exports.command = "canary <blueBranch> <greenBranch>";
exports.desc = "Spin up 3 local machines";

const inventoryPath = "/bakerx/canary_inventory.ini";
const filePath = "/bakerx/canary/canary-playbook.yml";
const canary_setup = "/bakerx/canary/canary-setup.yml";
const filePath2 = "/bakerx/canary/fetch-playbook.yml";

exports.builder = (yargs) => {
  yargs.options({});
};

exports.handler = async (argv) => {
  const { blueBranch, greenBranch } = argv;
  (async () => {
    if (blueBranch != null && greenBranch != null) {
      await run(blueBranch, greenBranch);  
    } else {
      console.error("Arguments missing");
    }
  })();
};

async function run(blueBranch, greenBranch) {
  console.log(chalk.blueBright("Provisioning blue server..."));
  let result = child.spawnSync(`bakerx`,`run blue focal --ip 192.168.33.30 --sync --memory 1024`.split(" "),{ shell: true, stdio: "inherit" });
  if (result.error) {console.log(result.error);process.exit(result.status);}

  console.log(chalk.blueBright("Provisioning green server..."));
  result = child.spawnSync(`bakerx`,`run green focal --ip 192.168.33.40 --memory 1024 --sync`.split(" "),{ shell: true, stdio: "inherit" });
  if (result.error) {console.log(result.error);process.exit(result.status);}

  console.log(chalk.blueBright("Provisioning proxy vm..."));
  result = child.spawnSync(`bakerx`,`run proxy focal --ip 192.168.33.50 --sync --memory 1024`.split(" "),{ shell: true, stdio: "inherit" });
  if (result.error) {console.log(result.error);process.exit(result.status);} 

  result = sshSync(`ansible-playbook ${canary_setup} -i ${inventoryPath} --vault-password-file .vault-pass`,"vagrant@192.168.33.20");
  if (result.error) {console.log(result.error);process.exit(result.status);}

  result = sshSync(`ansible-playbook ${filePath} -i ${inventoryPath} --vault-password-file .vault-pass -e "blue=${blueBranch}" -e "green=${greenBranch}"`,"vagrant@192.168.33.20");
  if (result.error) {console.log(result.error);process.exit(result.status);}
  console.log(chalk.blueBright("Waiting for canary report to be generated........"));
  await sleep(125000);  
  
  while (true) {
    if (fs.existsSync('canary/green.json') && fs.existsSync('canary/green.json')) { 
      break;
    }
    result = sshSync(`ansible-playbook ${filePath2} -i ${inventoryPath} --vault-password-file .vault-pass -e "blue=${blueBranch}" -e "green=${greenBranch}"`,"vagrant@192.168.33.20");
    if (result.error) {console.log(result.error);process.exit(result.status);}
    await sleep(5000);
  }
 
  await createCanaryReport();
  console.log(chalk.blueBright("Cleaning up the files & folders ........"));
  try {
    fs.unlinkSync('canary/blue.json')
    //file removed
  } catch(err) {
    console.error(err)
  }
  try {
    fs.unlinkSync('canary/green.json')
    //file removed
  } catch(err) {
    console.error(err)
  }
  
  // delete VMs

  console.log(chalk.blueBright("Deleting the VM(s)..."));
  result = child.spawnSync(`bakerx`, `delete vm green blue proxy`.split(" "), {
    shell: true,
    stdio: "inherit",
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
} 

async function createCanaryReport() {
  const blue_metrics = JSON.parse(await fs.readFileSync('canary/blue.json', 'utf8'));
  const green_metrics = JSON.parse(await fs.readFileSync('canary/green.json', 'utf8'));

  console.log(chalk.keyword('orange')('\n-------------- CANARY ANALYSIS REPORT ----------------'));

  var canaryScore = {
    'cpu': '',
    'memory': '',
    'latency': '',
    'statusCode': ''
  };

  var success = 0;
  for (metric in blue_metrics) {
    if (metric != 'name'){
    var minSize = Math.min(green_metrics[metric].length, blue_metrics[metric].length);
    var samples = [green_metrics[metric].slice(0, minSize), blue_metrics[metric].slice(0, minSize)];
    var u = mwu.test(samples);

   
    if (mwu.significant(u, samples)) {
      canaryScore[metric] = 'FAIL'
    }
    else {
      canaryScore[metric] = 'PASS'
      success += 1;  
    }
  }
}

var result = "CANARY ANALYSIS \t: FAILED";
if (canaryScore['statusCode'] == 'PASS') {    
  if (success / 4 >= 0.5)
    result = "CANARY ANALYSIS \t: PASSED !!!";
  else
    result =  "CANARY ANALYSIS \t: FAILED";
}
 
var report = '-------------------- CANARY ANALYSIS REPORT -------------------\n\n';

for (metric in canaryScore) {  
  if(metric == 'cpu') {
   report += '\t CPU Status \t\t : ' + canaryScore[metric] + '\n';
   console.log('\t CPU Status \t\t : ' + canaryScore[metric] + '\n');
  } else if(metric == 'memory') {
    report += '\t Memory Status \t\t : ' + canaryScore[metric] + '\n';
    console.log('\t Memory Status \t\t : ' + canaryScore[metric] + '\n');
  } else if(metric == 'latency') {
    report += '\t Latency Status \t : ' + canaryScore[metric] + '\n';
    console.log('\t Latency Status \t : ' + canaryScore[metric] + '\n');
  } else if(metric == 'statusCode') {
    report += '\t Http Status \t\t : ' + canaryScore[metric] + '\n';
    console.log('\t Http Status \t\t : ' + canaryScore[metric] + '\n');
  }
}
report += '---------------------------------------------------------------';
console.log('\n\t' + '---------------------------------------------------------------');
report += '\n\t' + "SCORE :"+success+"/4"
console.log('\n\t' + "SCORE :"+success+"/4");
report += '\n\t' + result
console.log('\n\t' + result);

fs.writeFileSync("canary_report.txt", report, 'utf8');
}
