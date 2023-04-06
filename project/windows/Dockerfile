FROM ubuntu:18.04

RUN apt-get update -y
RUN apt-get install -y qemu-kvm libvirt-daemon-system libvirt-dev
RUN apt-get install -y linux-headers-generic
RUN apt-get install -y build-essential
RUN apt-get install -y curl net-tools jq
RUN apt-get autoclean
RUN apt-get autoremove
RUN curl -O https://releases.hashicorp.com/vagrant/$(curl -s https://checkpoint-api.hashicorp.com/v1/check/vagrant  | jq -r -M '.current_version')/vagrant_$(curl -s https://checkpoint-api.hashicorp.com/v1/check/vagrant  | jq -r -M '.current_version')-1_amd64.deb
RUN dpkg -i vagrant_$(curl -s https://checkpoint-api.hashicorp.com/v1/check/vagrant  | jq -r -M '.current_version')-1_amd64.deb
RUN vagrant plugin install vagrant-libvirt
RUN vagrant box add --provider libvirt peru/windows-10-enterprise-x64-eval
RUN vagrant init peru/windows-10-enterprise-x64-eval

RUN apt-get install -y openssh-server
RUN apt-get install -y nano python3

COPY startup.sh /

ENTRYPOINT ["/startup.sh"]