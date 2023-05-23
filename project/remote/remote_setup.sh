#!/bin/sh

remote_ssh="remote_machine"
remote_ip="20.199.41.184"
remote_user="azureuser"
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
ssh "$remote_ssh" 'sudo apt-get update && sudo apt-get -y upgrade'

# Install Python 3 & rsync
ssh "$remote_ssh" 'sudo apt-get -y install python3 python3-pip rsync git openssh-client'

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

ssh_config_res2=$(ssh "$remote_ssh" "cat ~/.ssh/config | grep 'github.com'")

if [ -z "$ssh_config_res2" ]
then
    ssh "$remote_ssh" "echo '${ssh_config2}' >> ~/.ssh/config"
fi

# Pull Github Repository
ssh "$remote_ssh" 'git clone git@github.com:2dukes/PROJ_Thesis_2223.git'

# Create named FIFOs
ssh "$remote_ssh" "mkfifo PROJ_Thesis_2223/project/manager/mypipe"
ssh "$remote_ssh" "mkfifo PROJ_Thesis_2223/project/manager/cancel_mypipe"

# Get into project/ and Bootstrap Machine (bootstrap.yml)
ssh "$remote_ssh" "cd PROJ_Thesis_2223/project && /home/${remote_user}/.local/bin/ansible-playbook bootstrap.yml -v"

# Enable ip_tables & ip6_tables kernel module (Cloud Machine)
ssh "$remote_ssh" "sudo insmod /lib/modules/\$(uname -r)/kernel/net/ipv4/netfilter/ip_tables.ko"
ssh "$remote_ssh" "sudo insmod /lib/modules/\$(uname -r)/kernel/net/ipv6/netfilter/ip6_tables.ko"

# Launch UI
ssh "$remote_ssh" "cd PROJ_Thesis_2223/project && docker-compose down"
ssh "$remote_ssh" "docker exec -it attackermachine tailscale logout 1>/dev/null 2>&1 ; docker exec -it kvmcontainer tailscale logout 1>/dev/null 2>&1"
ssh "$remote_ssh" "kill -9 \$(ps -aux | grep \"runWS.sh\" | head -n 1 | tr -s \" \" | cut -d \" \" -f 2)"
ssh "$remote_ssh" "kill -9 \$(ps -aux | grep \"runWS.sh\" | head -n 1 | tr -s \" \" | cut -d \" \" -f 2)"
ssh "$remote_ssh" "kill -9 \$(ps -aux | grep \"websocketd --port=8080\" | head -n 1 | tr -s \" \" | cut -d \" \" -f 2)"
ssh "$remote_ssh" "kill -9 \$(ps -aux | grep \"runCancel.sh\" | head -n 1 | tr -s \" \" | cut -d \" \" -f 2)"
ssh "$remote_ssh" "docker rm -f \$(docker ps -a | grep -Ewv \"mongodb|backend|frontend|CONTAINER\" | cut -d \" \" -f1) 1>/dev/null 2>&1"

ssh "$remote_ssh" "cd PROJ_Thesis_2223/project && docker-compose up --build -d"
ssh "$remote_ssh" "cd PROJ_Thesis_2223/project/ctfs && python3 fetchCTFs.py"

# Start runWS.sh and runCancel.sh on a remote shell...
ssh "$remote_ssh" 'cd PROJ_Thesis_2223/project/manager && ./runWS.sh &!' & 
ssh "$remote_ssh" 'cd PROJ_Thesis_2223/project/manager && ./runCancel.sh &!' & 