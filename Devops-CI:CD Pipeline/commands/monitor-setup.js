const inventory = "/bakerx/inventory.ini";
const child = require("child_process");
const chalk = require("chalk");
const os = require("os");
const fs = require("fs");
const sshSync = require("../lib/ssh");
const playbook = "/bakerx/provision/monitor-playbook.yml";
exports.command = "monitor-setup";
exports.desc = "Provision cloud instances and control plane";
exports.builder = (yargs) => {
  yargs.options({
    i: {
    describe: 'inventory path',
    type: 'string'
},
});
};

exports.handler = async (argv) => {
  const { i } = argv;
  (async () => {
    if (inventory == '') {
        console.log(" Inventory Argument missing!!!");
    } else {
        await run(i);
      
    }
  })();
};

async function run(i) {
  console.log(chalk.greenBright("Configuring VMs"));
  result = sshSync(
    `ansible-playbook ${playbook} -i "/bakerx/${i}" --vault-password-file .vault-pass`,
    "vagrant@192.168.33.20"
  );
  
  if (result.error) {
    process.exit(result.status);
  }
}