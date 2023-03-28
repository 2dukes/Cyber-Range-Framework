#!/bin/bash

# Usage: sh switch_challenge.sh [scenario_name]

scenario_name=$1

ln -sf ../scenarios/${scenario_name}/challenge_vars.yml group_vars/scenario.yml
ln -sf ../scenarios/${scenario_name}/challenge_vars.yml host_vars/localhost.yml
