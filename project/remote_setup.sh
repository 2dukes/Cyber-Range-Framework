#!/bin/bash

$remote_ssh = "remote_machine"
$remote_ip = "100.1.2.3"
$remote_privKey = "~/.ssh/privRemote.rsa" # Private Key from Azure

# Local Tasks

ssh_config1="Host ${remote_ssh}
  HostName ${remote_ip}
  StrictHostKeyChecking no
  IdentityFile ${remote_privKey}
  IdentitiesOnly yes
  User root
  Port 22
"

$ssh_config_res=$(cat ~/.ssh/config | grep "${remote_ssh}")

if [ -z "$ssh_config_res" ]
then
    echo "$ssh_config1" >> ~/.ssh/config
fi

# Update Indexes
ssh "$remote_ssh" 'sudo apt-get update'

# Install Python 3
ssh "$remote_ssh" 'sudo apt-get -y install python3'

# Install Ansible
ssh "$remote_ssh" 'python3 -m pip install --user ansible'

# Copy SSH Repository Key (Deploy Key added specifically to this repository)
rsync "~/.ssh/remoteGithub" "$remote_ssh":~/.ssh

# Pull Github Repository (SSH KEY?)
ssh "$remote_ssh" 'git clone git@github.com:2dukes/PROJ_Thesis_2223.git'

# Get into project/
ssh "$remote_ssh" 'cd PROJ_Thesis_2223/project'

# Bootstrap Machine (bootstrap.yml)
ssh "$remote_ssh" 'ansible-playbook bootstrap.yml'