#!/bin/sh

remote_ssh="remote_machine"
remote_ip="20.199.9.184"
remote_user="admin_user"
local_github_key="/home/dukes/.ssh/remoteGithub"

# chmod 400 <private_key_path> | Private Key from Azure
remote_privKey="/home/dukes/Documents/ThesisWork/PROJ_Thesis_2223/project/remote/keys/FEUPVM_key.pem"

# Local Tasks

ssh_config1="Host ${remote_ssh}
  HostName ${remote_ip}
  StrictHostKeyChecking no
  IdentityFile ${remote_privKey}
  IdentitiesOnly yes
  User ${remote_user}
  Port 22
"

ssh_config_res1=$(cat ~/.ssh/config | grep "${remote_ip}")

if [ -z "$ssh_config_res1" ]
then
    echo "$ssh_config1" >> ~/.ssh/config
fi

# Update Indexes
ssh "$remote_ssh" 'sudo apt-get update'

# Install Python 3 & rsync
ssh "$remote_ssh" 'sudo apt-get -y install python3 python3-pip rsync'

# Install Ansible
ssh "$remote_ssh" 'pip install --user ansible'

# Copy SSH Repository Key (Deploy Key added specifically to this repository)
rsync "$local_github_key" "$remote_ssh":~/.ssh/id_rsa

# Remove Already Existing Github Repository
ssh "$remote_ssh" 'rm -rf PROJ_Thesis_2223'

ssh_config2="Host github.com
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/id_rsa
"

ssh_config_res2=$(ssh "$remote_ssh" 'cat ~/.ssh/config | grep "${remote_ip}"')

if [ -z "$ssh_config_res2" ]
then
    ssh "$remote_ssh" "echo '${ssh_config2}' >> ~/.ssh/config"
fi

# Pull Github Repository
ssh "$remote_ssh" 'git clone git@github.com:2dukes/PROJ_Thesis_2223.git'

# Get into project/ and Bootstrap Machine (bootstrap.yml)
ssh "$remote_ssh" "cd PROJ_Thesis_2223/project && /home/${remote_user}/.local/bin/ansible-playbook bootstrap.yml -v"
