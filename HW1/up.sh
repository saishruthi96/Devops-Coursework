#!/bin/bash
# Create VM
bakerx run ubuntu-vm focal

# Get ssh command
ssh_cmd=$(bakerx ssh-info ubuntu-vm|tr -d '"')
VBoxManage controlvm ubuntu-vm natpf1 nodeport,tcp,,8089,,9000
# Use heredoc to send script over ssh
$ssh_cmd << 'END_DOC'

# Install packages
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs git
# Get projects
git clone https://github.com/CSC-DevOps/App
# Setup project
cd App
npm install
exit
END_DOC

echo $ssh_cmd