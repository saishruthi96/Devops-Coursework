const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
var fs = require('fs'); 


const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');
const { clear } = require('console');
const filePath = "/bakerx/cm/playbook.yml";
const inventoryPath = "/bakerx/cm/inventory.ini";

exports.command = 'setup';
exports.desc = 'Provision and configure the configuration server';
exports.builder = yargs => {
    yargs.options({
        privateKey: {
            describe: 'Install the provided private key on the configuration server',
            type: 'string'
        }
    });
};


exports.handler = async argv => {
    const { privateKey } = argv;
    const filepath = 'cm/vars/.vault-pass';   

    if (fs.existsSync(filepath)) {
      
        (async () => {

            await run( privateKey );
    
        })();
    }
    else{
        console.log('Vault-pass file does not exist');
    }
   
};

async function run(privateKey) {
    
    console.log(chalk.greenBright('Installing configuration server!'));

    console.log(chalk.blueBright('Provisioning configuration server...'));
    let result = child.spawnSync(`bakerx`, `run config-srv focal --ip 192.168.33.20 --sync`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Loading privateKey on configuration server'));
    let identifyFile = privateKey || path.join(os.homedir(), '.bakerx', 'insecure_private_key');
    result = scpSync (identifyFile, 'vagrant@192.168.33.20:/home/vagrant/.ssh/mm_rsa');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Transfering vault-pass file on to the configuration server'));
    result = scpSync ('cm/vars/.vault-pass', 'vagrant@192.168.33.20:/home/vagrant/.vault-pass');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Running init script...'));
    result = sshSync('chmod +x /bakerx/cm/server-init.sh', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    result = sshSync("/bakerx/cm/server-init.sh", "vagrant@192.168.33.20");
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright("Running ansible script..."));

  result = sshSync("chmod +x  /bakerx/cm/run-ansible.sh","vagrant@192.168.33.20");
  if( result.error ) { console.log(result.error); process.exit( result.status ); }

  result = sshSync("/bakerx/cm/run-ansible.sh","vagrant@192.168.33.20");
  if( result.error ) { console.log(result.error); process.exit( result.status ); }

    result = sshSync(`ansible-playbook ${filePath} -i ${inventoryPath} --vault-password-file .vault-pass`,"vagrant@192.168.33.20");
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
}
