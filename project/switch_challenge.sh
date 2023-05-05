#!/bin/bash

# Usage: sh switch_challenge.sh [scenario_name]

scenario_name=$1

# Remove all pending containers except from website
docker rm -f $(docker ps -a | grep -Ev "mongodb|backend|frontend|CONTAINER" | cut -d ' ' -f1) 1>/dev/null 2>&1

ln -sf /dev/null group_vars/scenario.yml
ln -sf /dev/null host_vars/localhost.yml

if [[ "$scenario_name" == "ad" ]]
then
    ln -sf all_windows_server.yml group_vars/all.yml
elif [[ "$scenario_name" == "ransomware" ]]
then
    ln -sf all_windows.yml group_vars/all.yml
else
    ln -sf ../scenarios/${scenario_name}/challenge_vars.yml group_vars/scenario.yml
    ln -sf ../scenarios/${scenario_name}/challenge_vars.yml host_vars/localhost.yml
    ln -sf all_linux.yml group_vars/all.yml
fi
