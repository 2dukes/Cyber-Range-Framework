#!/bin/bash

chown root:kvm /dev/kvm

service libvirtd start
service virtlogd start

VAGRANT_DEFAULT_PROVIDER=libvirt vagrant up

vagrant rdp | awk 'NR==2 { print $3 }' | awk '{ print $1 }' FS=':' > file 2> /dev/null
ip_windows=$(cat file)

# Remote Desktop
iptables -A FORWARD -o virbr1 -p tcp --syn --dport 3389 -m conntrack --ctstate NEW -j ACCEPT
iptables -A FORWARD -o virbr1 -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A FORWARD -i virbr1 -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -t nat -A PREROUTING -p tcp --dport 3389 -j DNAT --to-destination "${ip_windows}"
iptables -t nat -A POSTROUTING -o virbr1 -p tcp --dport 3389 -d "${ip_windows}" -j SNAT --to-source 192.168.121.1

# PSRP
iptables -A FORWARD -o virbr1 -p tcp --syn --dport 5985 -m conntrack --ctstate NEW -j ACCEPT
iptables -t nat -A PREROUTING -p tcp --dport 5985 -j DNAT --to-destination "${ip_windows}"
iptables -t nat -A POSTROUTING -o virbr1 -p tcp --dport 5985 -d "${ip_windows}" -j SNAT --to-source 192.168.121.1
iptables -A FORWARD -o virbr1 -p tcp --syn --dport 5986 -m conntrack --ctstate NEW -j ACCEPT
iptables -t nat -A PREROUTING -p tcp --dport 5986 -j DNAT --to-destination "${ip_windows}"
iptables -t nat -A POSTROUTING -o virbr1 -p tcp --dport 5986 -d "${ip_windows}" -j SNAT --to-source 192.168.121.1

iptables -D FORWARD -o virbr1 -j REJECT --reject-with icmp-port-unreachable
iptables -D FORWARD -i virbr1 -j REJECT --reject-with icmp-port-unreachable
iptables -D FORWARD -o virbr0 -j REJECT --reject-with icmp-port-unreachable
iptables -D FORWARD -i virbr0 -j REJECT --reject-with icmp-port-unreachable

# Redirect from KVM -> Windows Server (TCP, UDP, ICMP)
iptables -t nat -A PREROUTING -i eth0 -p tcp ! --dport 22 -j DNAT --to-destination "${ip_windows}"
iptables -A FORWARD -i eth0 -o virbr1 -p tcp ! --dport 22 -j ACCEPT
iptables -t nat -A POSTROUTING -o virbr1 -p tcp ! --dport 22 -j SNAT --to-source 192.168.121.1

iptables -t nat -A PREROUTING -i eth0 -p udp ! --dport 22 -j DNAT --to-destination "${ip_windows}"
iptables -A FORWARD -i eth0 -o virbr1 -p udp ! --dport 22 -j ACCEPT
iptables -t nat -A POSTROUTING -o virbr1 -p udp ! --dport 22 -j SNAT --to-source 192.168.121.1

iptables -t nat -A PREROUTING -i eth0 -p icmp -j DNAT --to-destination "${ip_windows}"
iptables -A FORWARD -i eth0 -o virbr1 -p icmp -j ACCEPT
iptables -t nat -A POSTROUTING -o virbr1 -p icmp -j SNAT --to-source 192.168.121.1

# iptables -t nat -A PREROUTING -i eth0 -j DNAT --to-destination "${ip_windows}"
# iptables -A FORWARD -i eth0 -o virbr1 -j ACCEPT
iptables -A FORWARD -i virbr1 -o eth0 -j ACCEPT
# iptables -t nat -A POSTROUTING -o virbr1 -j SNAT --to-source 192.168.121.1

# Setup SSH
ssh-keygen -q -t rsa -N '' -f ~/.ssh/id_rsa <<<y >/dev/null 2>&1

service ssh start

cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys

sleep infinity