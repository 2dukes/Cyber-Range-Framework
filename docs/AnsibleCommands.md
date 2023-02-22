# Ansible Commands

Test ping module against all hosts using an SSH connection. If `-u root` is not passed, it assumes the default user running.
> `ansible all --key-file id_key -i inventory -u root -m ping`

Assumes the nearest `ansible.cfg` file.
> `ansible all -m ping`

List hosts.
> `ansible all --list-hosts`

Gather hosts facts.
> `ansible all -m gather_facts`

Or, more specific:
> `ansible all -m gather_facts --limit 172.17.0.2`

Update system.
> `ansible all -m apk -a update_cache=true`

If not with `root` privileges, then do:
> `ansible all -m apk -a update_cache=true --become --ask-become-pass`

`--become` tries to elevate ansible privileges to `sudo` and `--ask-become-pass` asks for the corresponding password. `-a` is a way to add arguments to the `apk` module.

Install package (`vim`):
> `ansible all -m apk -a name=vim`

Update package (`vim`):
> `ansible all -m apk -a "name=vim state=latest"`

Update all packages:
> `ansible all -m apk -a "upgrade=true"`

Run playbook:
> `ansible-playbook playbook.yml`

Show tags:
> `ansible-playbook --list-tags playbook.yml`

Run tasks ONLY associated with a specific tag:
> `ansible-playbook --tags apache playbook.yml`

Run tasks with specified tags:
> `ansible-playbook --tags "apache,vim" playbook.yml`