const chalk = require('chalk');
const fs    = require('fs');
const os    = require('os');
const path  = require('path');
const waitssh = require('waitssh');
//const VBexe = process.platform === 'win32' ? '"C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe"' : 'VBoxManage';
// const exec = require('child_process').exec;
const VBoxManage = require('../lib/VBoxManage');
const ssh = require('../lib/ssh');

exports.command = 'up';
exports.desc = 'Provision and configure a new development environment';
exports.builder = yargs => {
    yargs.options({
        force: {
            alias: 'f',
            describe: 'Force the old VM to be deleted when provisioning',
            default: false,
            type: 'boolean'
        }
    });
};


exports.handler = async argv => {
    const { force } = argv;

    (async () => {
    
        await up(force);

    })();

};

async function up(force)
{
    // Use current working directory to derive name of virtual machine
    let cwd = process.cwd().replace(/[/]/g,"-").replace(/\\/g,"-");
    let name = `V`;    
    console.log(chalk.keyword('pink')(`Bringing up machine ${name}`));

    // We will use the image we've pulled down with bakerx.
    let image = path.join(os.homedir(), '.bakerx', '.persist', 'images', 'focal', 'box.ovf');
    if( !fs.existsSync(image) )
    {
        console.log(chalk.red(`Could not find ${image}. Please download with 'bakerx pull cloud-images.ubuntu.com bionic'.`))
    }

    // We check if we already started machine, or have a previous failed build.
    let state = await VBoxManage.show(name);
    console.log(`VM is currently: ${state}`);
    if( state == 'poweroff' || state == 'aborted' || force) {
        console.log(`Deleting powered off machine ${name}`);
        // Unlock
        await VBoxManage.execute("startvm", `${name} --type emergencystop`).catch(e => e);
        await VBoxManage.execute("controlvm", `${name} --poweroff`).catch(e => e);
        // We will delete powered off VMs, which are most likely incomplete builds.
        await VBoxManage.execute("unregistervm", `${name} --delete`);
    }
    else if( state == 'running' )
    {
        console.log(`VM ${name} is running. Use 'V up --force' to build new machine.`);
        return;
    }

    // Import the VM using the box.ovf file and register it under new name.
    await VBoxManage.execute("import", `"${image}" --vsys 0 --vmname ${name}`);
    // Set memory size in bytes and number of virtual CPUs.
    await VBoxManage.execute("modifyvm", `"${name}" --memory 1024 --cpus 1`);
    // Disconnect serial port
    await VBoxManage.execute("modifyvm", `${name}  --uart1 0x3f8 4 --uartmode1 disconnected`);

    // Run your specific customizations for the Virtual Machine.
    await customize(name);

    // Start the VM.
    // Unlock any session.
    await VBoxManage.execute("startvm", `${name} --type emergencystop`).catch(e => e);
    // Real start.
    await VBoxManage.execute("startvm", `${name} --type headless`);

    // Explicit wait for boot
    let sshInfo = {port: 2800, hostname: 'localhost'}
    try {
        console.log(`Waiting for ssh to be ready on localhost:2800...`);        
        await waitssh(sshInfo);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }    
    console.log(`ssh is ready`);
    
    // Run your post-configuration customizations for the Virtual Machine.
    await postconfiguration();

}

async function customize(name)
{
    let path_host = path.join(os.homedir(),'sharedfol_host');
    console.log(chalk.keyword('pink')(`Running VM customizations...`));
    await VBoxManage.execute("modifyvm", `${name} --nic1 NAT`);
    await VBoxManage.execute("modifyvm", `${name} --natpf1 "guestssh,tcp,,2800,,22"`)
    await VBoxManage.execute("modifyvm", `${name} --natpf1 "nodeport,tcp,,9000,,5001"`)
    // Extra Requirements - 1
    // Referred - https://github.com/ottomatica/node-virtualbox/blob/master/lib/VBoxProvider.js#L264
    let networks = [];
    await VBoxManage.execute("list hostonlyifs","").then(function(result) {     
        result.split(/\r?\n\r?\n/).forEach(adapters => {              
            if(adapters.length > 0) {
                let adapter = {};
                adapters.split('\n').forEach(line => {
                    if(line.length > 0) {
                        let splitIdx = line.indexOf(':');
                        adapter[line.substr(0, splitIdx).trim()] = line.substr(splitIdx+1).trim();
                    }
                })
                networks.push(adapter);
            }
        })
    });  
   
    let VBOXNET;    
    if (networks.length == 0 )
    {
        // Since, the list is empty, creating one host-only interface and extracting the name
        let stdout = await VBoxManage.execute("hostonlyif create", "");
        VBOXNET = stdout.substr(stdout.indexOf(`'`) + 1, stdout.lastIndexOf(`'`) - stdout.indexOf(`'`) - 1);                       
    }
    else 
    {
         // If the list is not empty then extracting the first interface name.
        VBOXNET = networks[0].Name;              
    }
    // setting the host-only networking
    await VBoxManage.execute("hostonlyif", `ipconfig "${VBOXNET}" --ip 192.168.33.1`);
    await VBoxManage.execute("modifyvm", `${name} --nic2 hostonly --hostonlyadapter2 "${VBOXNET}"`); 
    // Extra Requirements - 2
    // Setting the shared folder
    await VBoxManage.execute("sharedfolder add", `${name} -name guest_share -hostpath ${path_host}`);
}

async function postconfiguration(name)
{
    console.log(chalk.keyword('pink')(`Running post-configurations...`));       
    ssh("'ls / ; curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -; ip a;sudo ip addr add 192.168.33.10/24 dev enp0s8;sudo ip link set enp0s8 up;sudo ip route add 192.168.33.0/24 dev enp0s8;sudo ip route add 192.168.33.10 via 192.168.33.1; sudo apt-get install -y nodejs git ; git clone https://github.com/CSC-DevOps/App ; cd App ; npm install; mkdir sharedfol_guest ; sudo mount -t vboxsf guest_share sharedfol_guest '");    
}


