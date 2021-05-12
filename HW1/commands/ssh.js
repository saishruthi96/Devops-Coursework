// Reference : https://docable.cloud/ssmirr/examples/tutorials/node-child_process.md

const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { spawn } = require('child_process');
//command and its description
exports.command="ssh";
exports.desc="SSH into the virtual machine (VM)";
exports.handler=async function ssh_manual(){
    let identifyFile = path.join(os.homedir(), '.bakerx', 'insecure_private_key');
    let sshExe = `ssh -i "${identifyFile}" -p 2800 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null vagrant@127.0.0.1 `;
    return new Promise(function (resolve, reject) {   
        spawn(`${sshExe}`, [], {stdio: 'inherit', shell: true});
});
}