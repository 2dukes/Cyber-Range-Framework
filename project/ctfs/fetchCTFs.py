import git
import os
import re
import shutil
import yaml
from yaml.loader import SafeLoader
from textwrap import dedent


def findall(p, s):
    '''Yields all the positions of
    the pattern p in the string s.'''
    i = s.find(p)
    while i != -1:
        yield i
        i = s.find(p, i+1)


def add_pack_dockerfile(path):
    with open(path, 'r+') as f:
        data = f.read()
        
        is_jail = False
        if re.search("pwn.red/jail:0.3.1", data):
            is_jail = True
            new_data = re.sub("pwn.red/jail:0.3.1", "2dukes/pwnred_jail", data)
            f.seek(0)
            f.write(new_data)
        
        match_pos = [i for i in findall('FROM', new_data if is_jail else data)]
        if len(match_pos) > 1 and not is_jail or len(match_pos) == 1:
            data = new_data if is_jail else data
            write_pos = data.find("\n", match_pos[-1]) + 1
            f.seek(write_pos)
            after_write_data = f.read()
            to_write_data = "\nRUN apt-get update && apt-get install -y iproute2 python3\n" + after_write_data
            f.seek(write_pos)
            f.write(to_write_data)


def rec_lookup_dockerfile(current_dir):
    files = os.listdir(current_dir)

    flag = False
    if "Dockerfile" in files:
        flag = True
        add_pack_dockerfile(f"{current_dir}/Dockerfile")

    for dir in [f for f in files if os.path.isdir(f"{current_dir}/{f}")]:
        flag |= rec_lookup_dockerfile(f"{current_dir}/{dir}")

    return flag


def remove_dir(path):
    shutil.rmtree(path)


def copy_dir(src, dst):
    shutil.copytree(src, dst, dirs_exist_ok=True)


def admin_file_exists(path):
    return os.path.exists(f"{path}/adminbot.js")


def write_vars(challenge_path, images, machines, dns, port_forwarding, setup):
    with open(f"{challenge_path}/challenge_vars.yml", 'w') as f:
        yaml.dump({
            "dns": dns,
            "vulnerables": {"images": images, "machines": machines},
            "port_forwarding": port_forwarding,
            "setup": {"machines": setup}
        }, f, indent=4)


def parse_admin_file(path):
    if admin_file_exists(path):
        admin_file_path = f"{path}/adminbot.js"
        with open(admin_file_path) as f:
            contents = f.read()

            var = "flag"
            if not re.search("import flag from '(.*flag.txt)'", contents):
                var = "token"

            match = re.search("import .* '(.*.txt)'", contents)
            flag_path = match.group(1)
            sub_flag_string = "const fs = require('fs');\n" \
                "const path = require('path');\n" \
                "const {var} = fs.readFileSync(path.resolve(__dirname, '{flag_path}'), 'utf8');".format(
                    var=var, flag_path=flag_path)

            # Import flag
            contents = re.sub("import .* from '.*.txt'",
                              sub_flag_string, contents)

            # Module export
            contents = re.sub("export default", "module.exports =", contents)

            # Setup/ Operations
            setup_path = f"{path}/setup"
            os.mkdir(setup_path)
            with open(f"{setup_path}/entrypoint.sh", 'w') as f:
                code = dedent("""\
                #!/bin/bash
                
                cd "$( dirname "$0" )"
                
                # Copy adminbot.js and flag file to Admin Bot API
                docker cp ../adminbot.js admin_bot_api:/backend/controllers
                docker cp ../{flag_path} admin_bot_api:/backend/controllers

                # Reload Docker container
                docker restart admin_bot_api
                """.format(flag_path=flag_path))
                f.write(code)

        with open(admin_file_path, 'w') as f:
            f.write(contents)


def parse_challenge(path, chal):
    challenge_description_path = f"{path}/challenge.yaml" if os.path.exists(
        f"{path}/challenge.yaml") else f"{path}/challenge.yml"

    with open(challenge_description_path) as f:
        data = yaml.load(f, Loader=SafeLoader)

        if "containers" not in data:
            remove_dir(path)
            return

        if "file" in data["flag"]:
            with open(f"{path}/{data['flag']['file']}") as f:
                flag = f.read()
        else:
            flag = data["flag"]

        # vulnerables["flag"] = flag

        # Construct images
        images = []
        machines = []
        dns = []
        port_forwarding = []
        setup = []

        last_ip_byte = 50

        # Reverse Proxy Image (ALWAYS needed)
        images.append({"name": "reverse_proxy",
                       "path": "reverse_proxy",
                       })

        # Reverse Proxy Machine (ALWAYS needed)
        # Optimistic approach because we only consider the first container as the one exposed by a domain.
        container_names = list(data["containers"].keys())
        first_container_name = container_names[0]
        reverse_proxy_vars = [{
            "domain": f"{chal}.mc.ax",
            "targets": [{
                "name": f"vuln_service_{chal}_{first_container_name}",
                "network": "dmz_net",
                "port": data["containers"][first_container_name]["ports"][0]
            }]
        }]

        # DNS Configuration (ALWAYS needed)
        # When there's more than 1 container
        number_containers = len(container_names)
        if number_containers > 1:
            for idx in range(1, number_containers):
                dns.append({
                    "domain": container_names[idx],
                    "internal": {
                        "machine": f"vuln_service_{chal}_{container_names[idx]}",
                        "network": "dmz_net"
                    },
                    "external": {
                        "machine": f"vuln_service_{chal}_{container_names[idx]}",
                        "network": "dmz_net"
                    },
                })

        dns.append({
            "domain": f"{chal}.mc.ax",
            "internal": {
                "machine": f"vuln_service_{chal}_{first_container_name}",
                "network": "dmz_net"
            },
            "external": {
                "machine": "edge_router",
                "network": "external_net"
            }
        })

        # Port Forwarding (ALWAYS needed)
        port_forwarding.append({
            "destination_port": 443,
            "to_machine": "reverse_proxy1",
            "to_network": "dmz_net",
            "to_port": 443
        })

        if admin_file_exists(path):
            # DNS
            dns.append({
                "domain": "adminbot.mc.ax",
                "internal": {
                    "machine": "reverse_proxy1",
                    "network": "dmz_net"
                },
                "external": {
                    "machine": "edge_router",
                    "network": "external_net"
                }
            })

            dns.append({
                "domain": "adminbotapi.mc.ax",
                "internal": {
                    "machine": "reverse_proxy1",
                    "network": "dmz_net"
                },
                "external": {
                    "machine": "edge_router",
                    "network": "external_net"
                }
            })

            # Reverse Proxy
            reverse_proxy_vars.append({
                "domain": "adminbot.mc.ax",
                "targets": [{
                    "name": "admin_bot_frontend",
                    "network": "dmz_net",
                    "port": 3000
                }]
            })

            reverse_proxy_vars.append({
                "domain": "adminbotapi.mc.ax",
                "targets": [{
                    "name": "admin_bot_api",
                    "network": "dmz_net",
                    "port": 8000
                }]
            })

            machines.append({
                "name": "admin_bot_frontend",
                "image": "admin_bot_frontend",
                "group": ['custom_machines'],
                "dns": {
                    "name": "dns_server",
                    "network": "dmz_net"
                },
                "networks": [{
                    "name": "dmz_net",
                    "ipv4_address": "172.{{ networks.dmz_net.random_byte }}.0.42"
                }],
            })

            machines.append({
                "name": "admin_bot_api",
                "image": "admin_bot_api",
                "group": ['custom_machines'],
                "dns": {
                    "name": "dns_server",
                    "network": "dmz_net"
                },
                "networks": [{
                    "name": "dmz_net",
                    "ipv4_address": "172.{{ networks.dmz_net.random_byte }}.0.43"
                }],
            })

            # Images
            images.append({
                "name": "admin_bot_api",
                "path": "bot/api",
            })

            images.append({
                "name": "admin_bot_frontend",
                "path": "bot/my-app",
                "args": {
                    "api": "adminbotapi.mc.ax"
                }
            })

            # Setup
            setup.append({
                "name": "localhost",
                "setup": "{{ playbook_dir }}" + f"/scenarios/{chal}/setup/"
            })

        # Import CA
        setup.append({
            "name": "attacker_machine",
            "setup": "{{ playbook_dir }}" + f"/scenarios/{chal}/attacker_machine_setup/*.j2"
        })

        copy_dir(f"{parent_dir}/attacker_machine_setup",
                 f"{path}/attacker_machine_setup")

        # Machines
        machines.append({
            "name": "reverse_proxy1",
            "image": "reverse_proxy",
            "group": ['reverse_proxies'],
            "dns": {
                "name": "dns_server",
                "network": "dmz_net"
            },
            "networks": [{
                "name": "dmz_net",
                "ipv4_address": "172.{{ networks.dmz_net.random_byte }}.0.40"
            }],
            "vars": reverse_proxy_vars
        })

        for container_name in data["containers"].keys():
            container_info = data["containers"][container_name]

            # Images
            build_path = chal
            if "context" in container_info['build']:
                build_path += f"/{container_info['build']['context']}"
            else:
                build_path += f"/{container_info['build']}"

            images.append({"name": f"{chal}_{container_name}",
                           "path": f"scenarios/{build_path}",
                           "args": {k: v for k, v in container_info['build']['args'].items()} if 'args' in container_info['build'] else {}
                           })

            # Ports, Environment Vars, Flags

            # Machines
            machines.append({"name": f"vuln_service_{chal}_{container_name}",
                             "image": images[-1]["name"],
                             "group": ["custom_machines"],
                             "dns": {"name": "dns_server", "network": "dmz_net"},
                             "exposed_ports": container_info["ports"] if "ports" in container_info else [],
                             "env": container_info["environment"] if "environment" in container_info else {},
                             "networks": [{
                                 "name": "dmz_net",
                                 "ipv4_address": "172.{{ networks.dmz_net.random_byte }}.0." + f"{last_ip_byte}"
                             }]
                             })

            last_ip_byte += 1

        write_vars(path, images, machines, dns, port_forwarding, setup)
        copy_dir(path, os.path.join(os.getcwd(), "..", "scenarios", chal))


def lookup_challenges(current_dir):
    categories = os.listdir(current_dir)

    for cat in [f for f in categories if os.path.isdir(f"{current_dir}/{f}")]:
        category_path = f"{current_dir}/{cat}"
        challenges = os.listdir(category_path)
        for chal in [f for f in challenges if os.path.isdir(f"{current_dir}/{cat}/{f}")]:
            challenge_path = f"{current_dir}/{cat}/{chal}"
            has_docker_build = rec_lookup_dockerfile(challenge_path)

            if not has_docker_build:
                remove_dir(challenge_path)
            else:
                parse_admin_file(challenge_path)
                parse_challenge(challenge_path, chal)

            # print(
            #     f"Category[{cat}] | Challenge[{chal}] => {has_docker_build}")


github_repositories = [
    {
        "url": "https://github.com/dicegang/dicectf-2023-challenges.git",
        "name": "dicectf-2023-challenges"
    }
]

parent_dir = os.getcwd()

for repo in github_repositories:
    repo_path = "{}/{}".format(parent_dir, repo["name"])

    if os.path.exists(repo_path):
        remove_dir(repo_path)

    git.Git(".").clone(repo["url"])
    remove_dir(f"{repo_path}/.git")
    lookup_challenges(repo_path)
