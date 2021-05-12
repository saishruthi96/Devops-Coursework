const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');
exports.command = 'deploy <job>';
exports.desc = 'Deploy the projects';
exports.builder = (yargs) => {
  yargs.options({
    job: {
      describe: 'Name of the application to be deployed',
      type: 'string',
    },
    i: {
      describe: 'Inventory file',
      type: 'string',
    },
  });
};

exports.handler = async (argv) => {
  const { job } = argv;
  const inventoryFile = encodeURIComponent(argv['i']);  
  (async () => {
    await run(job, inventoryFile);
  })();
};

async function run(job, inventoryFile) {   
  result = sshSync(
    `ansible-playbook --vault-password-file .vault-pass "/bakerx/cm/${job}_playbook.yml" -i "/bakerx/${inventoryFile}"`,
    'vagrant@192.168.33.20'
  );
  if (result.error) {
    console.log(result.error);
    process.exit(result.status);
  }
}