#!/bin/bash

docker cp kvmcontainer:/root/.ssh/id_rsa ~/.ssh/privKVM.rsa

# Optional
docker cp kvmcontainer:/root/.vagrant.d/insecure_private_key ~/.ssh/privWindows.rsa

ssh kvm vagrant rdp | awk 'NR==2 { print $3 }' | awk '{ print $1 }' FS=':' > tmp_file 2> /dev/null
ip_windows=$(cat tmp_file)

rm -rf tmp_file

ssh_config1="Host kvm
  HostName 172.17.0.2
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/privKVM.rsa
  IdentitiesOnly yes
  User root
  Port 22
"

echo "$ssh_config" > ~/.ssh/config

ssh_config2="Host windows
  HostName ${ip_windows}
  StrictHostKeyChecking no
  IdentityFile ~/.ssh/privWindows.rsa
  IdentitiesOnly yes
  User administrator
  Port 22
  ProxyJump kvm"

echo "$ssh_config" >> ~/.ssh/config

mkdir ~/.ssh/cp
ssh -o "ControlMaster=auto" -o "ControlPersist=no" -o "ControlPath=~/.ssh/cp/ssh-%r@%h:%p" -CfNq -D 127.0.0.1:1234 kvm

# Stop OR Check
# ssh -o "ControlPath=~/.ssh/cp/ssh-%r@%h:%p" -O stop|check kvm