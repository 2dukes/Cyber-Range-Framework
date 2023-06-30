FROM ubuntu:18.04

RUN apt-get update -y
RUN apt-get install -y qemu-kvm libvirt-daemon-system libvirt-dev
RUN apt-get install -y linux-headers-generic
RUN apt-get install -y build-essential
RUN apt-get install -y curl net-tools jq
RUN apt-get autoclean
RUN apt-get autoremove
RUN curl -O https://releases.hashicorp.com/vagrant/2.3.6/vagrant_2.3.6-1_amd64.deb
RUN dpkg -i vagrant_2.3.6-1_amd64.deb
RUN vagrant plugin install vagrant-libvirt
RUN vagrant box add --provider libvirt peru/windows-server-2022-standard-x64-eval
RUN vagrant init peru/windows-server-2022-standard-x64-eval

RUN apt-get install -y openssh-server
RUN apt-get install -y nano python3

COPY startup.sh /

ENTRYPOINT ["/startup.sh"]