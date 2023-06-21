# Cyber Range Framework

Cyber ranges are critical nowadays when thinking of cybersecurity training. Professionals, enthusiasts, students, and many more people have knowledge gaps they want to fill in cybersecurity. 

This code base shows a cyber range framework suited for local and cloud deployments, where a trainee can build upon his skills and have realistic experience when facing real-world scenario threats, such as Log4j, Ransomware, and Active Directory attacks! This means we support both Linux and Windows-based scenarios! Using an approach heavily reliant on lightweight Docker containers and Infrastructure as Code tools like Ansible, we can deploy scenarios in a single machine but with the complexity of an enterprise-level network. Lastly, this framework also employs randomized scenarios, as on every new scenario execution, random IP addresses are assigned to the machines part of the network.

## **Network Architecture** 

![](./project/image/../images/example_arch.png)

Above, we can see the network architecture of an example scenario. Every service consists of a Docker container. The entire network is configured and provisioned by Ansible. The vulnerable service, the container the trainee needs to target, differs across each scenario. The attacker machine is a Kali Linux container with the Xfce Desktop Environment installed where the trainee should perform offensive tasks. It is accessible via VNC on port 6080. Some network services, such as the DNS server, Reverse Proxy, Firewalls, and DHCP server, have been created, as well as three distinct networks: internal, DMZ, and external.

In the case of Windows-based scenarios, the network configuration may vary slightly, and a Vagrant box is installed within a Linux Docker container featured with the KVM hypervisor. Windows VMs are always accessible through Remote Desktop.

## Scenarios

This section will present the scenarios the framework currently revolves around.

## Custom Scenarios

As mentioned above, the most complex scenarios of our framework are:

| Scenario                      | Description                                      | References        | Exploit             |
| ----------------------------- | ------------------------------------------------ | ----------------- | ------------------- |
| [Apache Log4 (CVE-2021-44228) [**Linux Attack-Oriented**]](project/scenarios/log4j/) | Presents the trainee with a UniFi network dashboard vulnerable to Log4j attacks. | [Hack The Box Unified](https://www.hackthebox.com/machines/unified) | [Here](project/scenarios/log4j/README.md)
| [Malicious Ransomware PE [**Windows Forensics-Oriented**]](project/windows/) | The trainee is given a malicious PE file showing a simple Ransomware that performs encryption activities. | [FireEye 2016 Edition Challenge 2](project/windows/scenarios/ransomware/solution/challenge2-solution.pdf) </br></br> [Malware Analysis And Incident Forensics - Sapienza Università di Roma](project/windows/scenarios/ransomware/solution/MAIF%2BSES-2022-Lab05-DudeLocker.pdf) | [Here](project/windows/scenarios/ransomware/solution/)
| [Vulnerable Active Directory Domain Controller [**Windows Attack-Oriented**]](project/ad/) | Vulnerable AD Domain Controller to a wide range of attack paths. | [WazeHell GitHub](https://github.com/WazeHell/vulnerable-AD) </br></br> [John Hammond AD Youtube Series](https://www.youtube.com/watch?v=pKtDQtsubio&list=PL1H1sBF1VAKVoU6Q2u7BBGPsnkn-rajlp) | [Here](project/ad/README.md)

## Imported Scenarios

The other set of scenarios were imported from the [DiceCTF](https://ctf.dicega.ng/) 2023 competition.

| Category | Challenge                                                   |
| -------- | ----------------------------------------------------------- |
| web      | [codebox](project/scenarios/codebox/)                       |
| web      | [gift](project/scenarios/gift/)                             |
| web      | [impossible-xss](project/scenarios/impossible-xss/)         |
| web      | [jnotes](project/scenarios/jnotes/)                         |
| web      | [jwtjail](project/scenarios/jwtjail/)                       |
| web      | [recursive-csp](project/scenarios/recursive-csp/)           |
| web      | [scorescope](project/scenarios/scorescope/)                 |
| web      | [unfinished](project/scenarios/unfinished/)                 |
| pwn      | [baby-solana](project/scenarios/baby-solana/)               |
| pwn      | [bop](project/scenarios/bop/)                               |
| pwn      | [chessrs](project/scenarios/chessrs/)                       |
| pwn      | [disc-pwn](project/scenarios/disc-pwn/)                     |
| pwn      | [dicer-visor](project/scenarios/dicer-visor/)               |
| pwn      | [otterorld](project/scenarios/otterworld/)                 |
| pwn      | [sice-supervisor](project/scenarios/sice-supervisor/)       |
| pwn      | [term-zelda](project/scenarios/term-zelda/)                 |
| misc     | [geminiblog](project/scenarios/geminiblog/)                 |
| misc     | [mlog](project/scenarios/mlog/)                             |
| misc     | [Pike](project/scenarios/pike/)                             |
| misc     | [Prison Reform](project/scenarios/prison-reform/)           |
| crypto   | [bbbb](project/scenarios/bbbb/)                             |
| crypto   | [provably-secure](project/scenarios/provably-secure/)       |
| crypto   | [provably-secure-2](project/scenarios/provably-secure-2/)   |
| crypto   | [seaside](project/scenarios/seaside/)                       |
| crypto   | [vinaigrette](project/scenarios/vinaigrette/)               |


# Architecture & Scenario Extensibility Thoughts

The structure followed along the project is based on Ansible [roles](https://github.com/2dukes/PROJ_Thesis_2223/tree/main/project/roles), [groups](https://github.com/2dukes/PROJ_Thesis_2223/blob/main/project/inventory/dynamic_inv.py) and [variables](https://github.com/2dukes/PROJ_Thesis_2223/tree/main/project/group_vars).

Three main playbooks exist within the project:
- [setup_containers.yml](project/setup_containers.yml) suited for every DiceCTF scenario and for the Log4j scenario.
- [setup_win_ransomware.yml](project/setup_win_ransomware.yml) suited for the Windows Ransomware scenario.
- [setup_win_ad.yml](project/setup_win_ad.yml) suited for the Windows Active Directory scenario.

Every scenario is featured with a `challenge_vars.yml` file where custom scenario variables are specified apart from the [standard network variables](project/group_vars/), which work as a basis for the general network structure. Related to the custom scenario variables, some network configurations should be specified:

- [DNS Configurations](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/scenarios/log4j/challenge_vars.yml#L1) related to the mapped domains of the vulnerable services and where internal and external DNS queries should be mapped to.
  
- [Reverse Proxy Configurations](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/scenarios/log4j/challenge_vars.yml#L59) which handle the communication between the trainee machine (attacker machine in most scenarios) and the vulnerable services mapped through a domain.
  
- [Docker Images](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/scenarios/log4j/challenge_vars.yml#L25) which show the images necessary for setting up the scenario, apart from the ones included in the general network structure. This configuration should always include the DNS and the Reverse Proxy.
  
- [Docker Containers](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/scenarios/log4j/challenge_vars.yml#L40) as the vulnerable machines to be included in the scenario.
  
- [Port Forwarding](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/scenarios/log4j/challenge_vars.yml#L103) on the Edge router, as external requests are always mapped through the Edge Router and then redirected either to the vulnerable service or the reverse proxy.
  
- [Setup Instructions](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/scenarios/log4j/challenge_vars.yml#L113) which are specified in the form of an `entrypoint.sh.j2` script (non-localhost) or `entrypoint.sh` (localhost) and contain instructions for setting up machines.

Still, regarding *"Setup Instructions"*, every vulnerable service is mapped via a domain, and an HTTPS connection is always achieved. To achieve this, a root CA had to be created. As such, the attacker's Kali machine entry point instructions must always turn issued digital certificates for the domains of the vulnerable services (and other available services) as trusted both system-wide and in the Firefox browser. An example entry point configuration is available [here](https://github.com/2dukes/PROJ_Thesis_2223/tree/main/project/ctfs/attacker_machine_setup).

To expand Windows scenarios, similar Ansible configurations may be created. Examples include the [Ransomware scenario](https://github.com/2dukes/PROJ_Thesis_2223/tree/main/project/windows) and the [AD scenario](https://github.com/2dukes/PROJ_Thesis_2223/tree/main/project/ad).

# Requirements

To meet the project's requirements, the following instructions should be performed:

- Install required packages:

```sh
sudo apt update && sudo apt install python3 python3-pip python3-requests websocketd rdesktop
```

- Install Ansible:

```sh
pip install --user ansible
```

- Create named FIFOs:
 
```sh
mkfifo PROJ_Thesis_2223/project/manager/mypipe
mkfifo PROJ_Thesis_2223/project/manager/cancel_mypipe
```

- Install Docker, docker-compose, necessary Python modules, and Tailscale with the [bootstrap.yml](project/bootstrap.yml) playbook. **This playbook is suited for Ubuntu-based machines only!**

```sh
ansible-playbook bootstrap.yml
```

If using a different distribution, the following packages must be installed:
- Docker
- Docker-Compose
- Python Modules with:

```sh
pip install -U 'requests[socks]'
pip install pypsrp python-dotenv
pip install -r PROJ_Thesis_2223/project/ctfs/requirements.txt
```

Then, the Ansible host device should install Tailscale and join a *Tailnet* Mesh network, according to the steps mentioned in Section [Tailscale & Cloud Deployments](#tailscale--cloud-deployments).

> **The Ansible host machine needs to have virtualization enabled to run Windows-based scenarios.**

## *.env* Configuration

Environment variables files play a crucial role during the setup.

At first, we have the [Import CTFs .env](project/ctfs/.env) file, which provides several variables on the script that imports the DiceCTF scenarios. No changes should be needed except for the `OPENAI_KEY` variable used in the `mlog` challenge.

Then, we have the [UI Backend .env](project/manager/backend/.env), which has the predefined value in case the environment is cloud-based, meaning a remote machine, otherwise it should be `ENVIRONMENT='development'`.

Lastly, the [UI frontend .env](project/manager/frontend/.env) targets the machine hosting the framework UI domain. In case of cloud deployments, it should map Tailscale's Mesh network domain pointing to the remote machine, typically in the format of `MACHINE_HOSTNAME=[REMOTE_MACHINE_HOSTNAME].[MAGICDNS_TAILSCALE_DOMAIN]`. In the case of local executions, it should have the `MACHINE_HOSTNAME='localhost'` content.

## Tailscale & Cloud Deployments

As mentioned throughout the document, we have used Tailscale to support cloud deployments into a remote machine. This way, every device that needs to be externally available to the trainee is part of the Tailscale Mesh network and, therefore, accessible through the exterior.

During the testing phase, we used Microsoft Azure as our cloud provider. We created a Standard D2ads v5 and a Standard E2bs v5 Azure Virtual Machine featured with 2 vCPUs, 8GB and
16GB of RAM, respectively, and 128GB disk space due to the amount of memory the current
cyber ranges take. The OS used was Ubuntu 22.04. Notice the selected VMs need to have KVM
virtualization enabled; otherwise, the setup of Windows-based scenarios will not work.

To perform such setup, an ephemeral key should be created in the Tailscale configuration and updated in the [appropriate Ansible inventory script line](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/inventory/dynamic_inv.py#L14).

### Cloud Deployment Configurations

Lastly, we have created a [remote_setup.sh](project/remote/remote_setup.sh) script tested in Microsoft Azure's Virtual Machines that successfully performs cloud deployments. Still, [some variables](https://github.com/2dukes/PROJ_Thesis_2223/blob/4057851b5e61cdcc27665e956e8f03d6f0ee4ac5/project/remote/remote_setup.sh#L3-L9) need to be configured:

- `remote_ssh` the SSH hostname of the remote machine.
- `remote_ip` as the external IP address of the remote machine.
- `remote_user` with the root user's name in the remote machine.
- `remote_privKey` as the path to the private SSH remote key that enables access to the remote machine.
- `local_github_key` as the path to the framework's GitHub repository deploy key. This key has read-only permissions, so the target machine can only pull data from the repository. The private key's contents are as follows:
 
 ```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDmhR9yKlJuedUJTqernxesPuRxK8Zh9hMhatT5ZzpWGAAAAJhlMqjXZTKo
1wAAAAtzc2gtZWQyNTUxOQAAACDmhR9yKlJuedUJTqernxesPuRxK8Zh9hMhatT5ZzpWGA
AAAED0zTl2e/UyixMy2k6Ps2idm1cnd+bqY+1bWHDXYc65P+aFH3IqUm551QlOp6ufF6w+
5HErxmH2EyFq1PlnOlYYAAAAEnJlbW90ZUBtYWNoaW5lLmNvbQECAw==
-----END OPENSSH PRIVATE KEY-----
```

# Running Scenarios

For running scenarios, the [switch_challenge.sh](project/switch_challenge.sh) script always resets the execution of the current scenario and applies the necessary configurations to launch a new one. Its usage is `sh switch_challenge.sh [scenario_name]`:

- To switch to the Log4j scenario we can run `sh switch_challenge.sh log4j`
- To switch to the Windows-based Ransomware scenario, we can run `sh switch_challenge.sh ransomware`
- To switch to the Windows-based Ransomware scenario, we can run `sh switch_challenge.sh active-directory`
- To switch to one of the DiceCTF scenarios, specify any of the names presented in the above table.

To then start scenarios, we run:

```sh
# Linux-based Scenarios
ansible-playbook setup_containers.yml

# Windows-based Ransomware Scenario
ansible-playbook setup_win_ransomware.yml

# Windows-based Active Directory Scenario
ansible-playbook setup_win_ad.yml
```

*Some executions may take a while due to the process of setting up machines and building Docker images, especially in the first execution.*

For each scenario the trainee is able to access some scenario's containers using VNC or Remote Desktop. 

| Machine   | Deployment Type | Domain   |
| --------- | --------------- | -------- |
| Vulnerable Service (**Log4j**) | Any | `https://example-domain.ui.com:8443` |
| Vulnerable Service (**DiceCTF**) | Any | `https://[DICECTF_SCENARIO_NAME].mc.ax` |
| Kali Linux Attacker Machine | Local | [http://localhost:6080/vnc_auto.html](http://localhost:6080/vnc_auto.html)
| Kali Linux Attacker Machine | Cloud | [http://attackermachine.[MAGICDNS_TAILSCALE_NETWORK_DOMAIN]:6080/](http://attackermachine.[MAGICDNS_TAILSCALE_NETWORK_DOMAIN]:6080/)
| Windows Vagrant Box | Local | `rdesktop [LOCAL_KVM_CONTAINER_IP]` |
| Windows Vagrant Box | Cloud | `rdesktop kvmcontainer.[MAGICDNS_TAILSCALE_NETWORK_DOMAIN]` |
| UI Panel | Local | [http://localhost:3000/](http://localhost:3000/) |
| UI Panel | Cloud | [http://local.[MAGICDNS_TAILSCALE_NETWORK_DOMAIN]:3000](http://local.[MAGICDNS_TAILSCALE_NETWORK_DOMAIN]:3000) |


> The vulnerable services from the first two rows are accessible through the Kali Attacker Machine. In case of local deployments, accessing the Bash console of the Attacker Machine's Docker container via `docker exec -it attackermachine /bin/sh` is also possible.

# UI

For users who want to keep it simple, we have developed a UI where they can launch scenarios while receiving real-time feedback on the scenarios' execution steps and mark them as solved.

A [launchUI.sh](project/launchUI.sh) script was created to deploy the UI. By running `./launchUI.sh`, the final outcome should be as follows:

![](./project/images/ui_dashboard.png)

> **Further instructions can be found in the project's [Report](report/dissertation.pdf).**