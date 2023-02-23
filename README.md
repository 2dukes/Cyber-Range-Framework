# PROJ_Thesis_2223

# Setup

## Steps

## Step 1

Install Ansible `python3 -m pip install --user ansible`

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

Build test image:
`docker build -t ubuntu_test_image -f LocalSetupDockerfile .`

Run container:
`docker run --name ubuntu_test -d ubuntu_test_image`

Prompt container:
`docker exec -it ubuntu_test bash`
    Setup local configuration by installing Docker and SSH client; initializing configurations:
        `ansible-playbook setup_local.yml`
    