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