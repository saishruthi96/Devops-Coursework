const child = require("child_process");
const chalk = require("chalk");
const path = require("path");
const os = require("os");
const fs = require("fs");
const sshSync = require("../lib/ssh");
const inventoryPath = "/bakerx/cm/inventory.ini";
const playbook = "/bakerx/provision/provision.yml";


exports.command = "prod <command>";
exports.desc = "Provision cloud instances and control plane";
exports.builder = (yargs) => {
  yargs.options({});
};

exports.handler = async (argv) => {
  const { command } = argv;
  (async () => {
    if (command == "up") {
      await run();
    } else {
      console.log("COMMAND NOT FOUND!!!");
    }
  })();
};

async function run() {
  console.log(chalk.greenBright("Provisioning VMs"));
  result = sshSync(`ansible-playbook ${playbook} -i ${inventoryPath} --vault-password-file .vault-pass`,"vagrant@192.168.33.20");
  if (result.error) {process.exit(result.status);}

  console.log(chalk.greenBright("changing the host verification to no in ssh"));
  result = sshSync(`sudo cp /bakerx/provision/config /home/vagrant/.ssh/config`,"vagrant@192.168.33.20");
  if (result.error) {process.exit(result.status);}
  
}