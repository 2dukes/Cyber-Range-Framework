#!/bin/bash

# Publish New Pwn Jail image to DockerHub

# Clone Jail Repository
git clone --recurse-submodules https://github.com/redpwn/jail.git

# Build Busybox Image (v1.34.1) with python3 already installed
docker build -t busybox_test -f Dockerfile_busybox .

cd jail/

# Build Jail image
docker build -t pwn_red_jail .

# Test Jail
# docker run -dp 12345:5000 --privileged --name pwn_test pwn_red_jail

# Login DockerHub

# Publish Image in DockerHub
docker tag pwn_red_jail:latest 2dukes/pwnred_jail

docker push 2dukes/pwnred_jail