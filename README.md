# PROJ_Thesis_2223

# Setup

## Step 1

Install Ansible `python3 -m pip install --user ansible`.

Create SSH key pairs to connect from workstation to containers with SSH using Ansible.

```
╭─dukes@fs0c1ety ~/Documents/ThesisWork/PROJ_Thesis_2223 ‹main› 
╰─$ ssh-keygen -t ed25519 -C "Thesis_Containers"                                                                                         1 ↵
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/dukes/.ssh/id_ed25519): /home/dukes/Documents/ThesisWork/PROJ_Thesis_2223/id_key
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/dukes/Documents/ThesisWork/PROJ_Thesis_2223/id_key
Your public key has been saved in /home/dukes/Documents/ThesisWork/PROJ_Thesis_2223/id_key.pub
```

## Connect to Container

`ssh -i id_key root@ip`

# Local Setup Test

This setup assumes both `ansible` and `python3` (along with `pip`) are already installed in the local machine. Otherwise, running the playbooks would not be possible.

> If Docker images don't exist already, there might be errors. It's advisable to run this playbooks' outside a container.

- **Playbooks**:
  - `bootstrap.yml`
    - Installs Docker, and the SSH client.
    - Sets up SSH keys for communication with containers.
  - `setup_containers.yml`
    - Starts necessary containers.

**Build test image:**

`docker build -t ubuntu_test_image -f LocalSetupDockerfile .`

**Run container:**

`docker run --name ubuntu_test --privileged=true -v /var/run/docker.sock:/var/run/docker.sock -d ubuntu_test_image`

> Docker-in-Docker because we need to instantiate Docker containers inside the container which then are visible to the host machine.

**Prompt container:**

`docker exec -it ubuntu_test bash`

- Setup local configuration by installing Docker and SSH client; initializing configurations:

    `ansible-playbook bootstrap.yml`
    `ansible-playbook setup_containers.yml`
    