# PROJ_Thesis_2223

## Steps

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