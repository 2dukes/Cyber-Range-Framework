#!/bin/bash

docker build -t ubuntukvm_windows -f Dockerfile .

docker run --privileged -it --name kvmcontainer --device=/dev/kvm --device=/dev/net/tun -v /sys/fs/cgroup:/sys/fs/cgroup:rw --cap-add=NET_ADMIN --cap-add=SYS_ADMIN ubuntukvm_windows bash