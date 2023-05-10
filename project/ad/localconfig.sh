#!/bin/bash

sleep 720

docker cp kvmcontainer:/root/.ssh/id_rsa ~/.ssh/privKVM.rsa

# Optional
docker cp kvmcontainer:/root/.vagrant.d/insecure_private_key ~/.ssh/privWindows.rsa

kvmcontainer_ip=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' kvmcontainer)

ssh_config1="Host kvm
  HostName ${kvmcontainer_ip}
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/privKVM.rsa
  IdentitiesOnly yes
  User root
  Port 22
"

echo "$ssh_config1" > ~/.ssh/config

ssh kvm vagrant rdp | awk 'NR==2 { print $3 }' | awk '{ print $1 }' FS=':' > tmp_file 2> /dev/null
ip_windows=$(cat tmp_file)

ssh_config2="Host windows
  HostName ${ip_windows}
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/privWindows.rsa
  IdentitiesOnly yes
  User administrator
  Port 22
  ProxyJump kvm"

echo "$ssh_config2" >> ~/.ssh/config

ssh -o "ControlPath=~/.ssh/cp/ssh-%r@%h:%p" -O stop kvm 2> /dev/null
rm -rf ~/.ssh/known_hosts

mkdir -p ~/.ssh/cp
ssh -o "ControlMaster=auto" -o "ControlPersist=no" -o "ControlPath=~/.ssh/cp/ssh-%r@%h:%p" -CfNq -D 127.0.0.1:1234 kvm

# Stop OR Check
# ssh -o "ControlPath=~/.ssh/cp/ssh-%r@%h:%p" -O stop|check kvm