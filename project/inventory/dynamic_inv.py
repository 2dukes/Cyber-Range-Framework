#!/usr/bin/python3

import argparse
import random
import json


class ExampleInventory(object):

    def __init__(self):
        self.inventory = {}
        self.read_cli_args()
        self.random_value = random.randint(30, 254)
        self.tailscale_auth_key = "tskey-auth-kTSJzw2CNTRL-KJ6cnQoUQWdurbahKkpHXdqZ25nFMeRb"

        # Called with `--list`.
        if self.args.list:
            self.inventory = self.example_inventory()
        # Called with `--host [hostname]`.
        elif self.args.host:
            # Not implemented, since we return _meta info `--list`.
            self.inventory = self.empty_inventory()
        # If no groups or vars are present, return an empty inventory.
        else:
            self.inventory = self.empty_inventory()

        print(json.dumps(self.inventory))

    # Example inventory for testing.
    def example_inventory(self):
        return {
            "all": {
                "vars": {
                    "ansible_python_interpreter": "/usr/bin/python3",
                    "random_byte": self.random_value,
                    "tailscale_auth_key": self.tailscale_auth_key
                },

            },
            "pcs": {
                "hosts": []
            },
            "routers": {
                "hosts": [],
                "vars": {
                    "random_byte": self.random_value
                }
            },
            "dhcp_servers": {
                "hosts": []
            },
            "dns_servers": {
                "hosts": []
            },
            "custom_machines": {
                "hosts": [],
                "vars": {
                    "random_byte": self.random_value
                }
            },
            "firewalls": {
                "hosts": []
            },
            "external": {
                "hosts": [],
                "vars": {
                    "random_byte": self.random_value
                }
            },
            "reverse_proxies": {
                "hosts": []
            },
            "internal": {
                "children": ["pcs", "dhcp_servers"],
                "vars": {
                    "random_byte": self.random_value
                }
            },
            "dmz": {
                "children": ["dns_servers", "custom_machines", "reverse_proxies"],
                "vars": {
                    "random_byte": self.random_value
                }
            },
            "mesh": {
                "hosts": [],
                "vars": {
                    "tailscale_auth_key": self.tailscale_auth_key
                }
            },
            "scenario": {
                "hosts": [],
                "children": ["pcs", "routers", "custom_machines", "dns_servers", "dhcp_servers", "firewalls", "external", "reverse_proxies"],
                "vars": {
                    "random_byte": self.random_value
                }
            },
            "machine": {
                "vars": {
                    "ansible_user": "administrator",
                    "ansible_password": "vagrant",
                    "ansible_connection": "psrp",
                    "ansible_psrp_protocol": "http",
                    "ansible_psrp_proxy": "socks5h://localhost:1234"
                }
            }
        }

    # Empty inventory for testing.
    def empty_inventory(self):
        return {'_meta': {'hostvars': {}}}

    # Read the command line args passed to the script.
    def read_cli_args(self):
        parser = argparse.ArgumentParser()
        parser.add_argument('--list', action='store_true')
        parser.add_argument('--host', action='store')
        self.args = parser.parse_args()


ExampleInventory()
