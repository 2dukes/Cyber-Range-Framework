import git
import os
import re
import shutil
import yaml
import pymongo
import json
from yaml.loader import SafeLoader
from textwrap import dedent
from dotenv import load_dotenv
from operator import itemgetter

load_dotenv()

customized_scenario_confs = {
    "mlog": {
        "args": {
            "OPENAI_KEY": os.getenv('OPENAI_KEY')
        }
    }
}


def findall(p, s):
    '''Yields all the positions of
    the pattern p in the string s.'''
    i = s.find(p)
    while i != -1:
        yield i
        i = s.find(p, i+1)


def add_pack_dockerfile(path):
    is_jail = False

    with open(path, 'r+') as f:
        data = f.read()

        # Dockerfile with "COPY --chmod=755 <path1> <path2>" restriction
        if re.search("COPY --chmod=\d{3} .*\s.*", data):
            new_data = re.sub(
                "COPY --chmod=(\d{3}) (.*?)\s(.*)\n", r"COPY \2 \3\nRUN chmod \1 \3\n", data)
            f.seek(0)
            f.write(new_data)

        f.seek(0)
        data = f.read()

        # Dockerfile with "ADD|COPY <path1> <path2> ." restriction
        if re.search("(ADD|COPY) .*\s.*\s\.", data):
            new_data = re.sub("((ADD|COPY) .*\s.*\s\.)", r"\1/", data)
            f.seek(0)
            f.write(new_data)

        f.seek(0)
        data = f.read()

        # Pwn Jail Docker image
        if re.search("pwn.red/jail:0.3.1", data):
            is_jail = True
            new_data = re.sub("pwn.red/jail:0.3.1", "2dukes/pwnred_jail", data)
            f.seek(0)
            f.write(new_data)

        # Install python3 and iproute2 packages
        match_pos = [i for i in findall('FROM', new_data if is_jail else data)]
        if not is_jail:
            data = new_data if is_jail else data
            write_pos = data.find("\n", match_pos[-1]) + 1
            f.seek(write_pos)
            after_write_data = f.read()
            to_write_data = "\nRUN apt-get update && apt-get install -y iproute2 python3\n" + after_write_data
            f.seek(write_pos)
            f.write(to_write_data)

    return is_jail


def check_excluded_images(path):
    with open(path, 'r') as f:
        data = f.read()

        exclude_images = os.getenv('EXCLUDED_IMAGES_AND_CHALLENGES').split(',')
        for exc_img in exclude_images:
            if re.search(exc_img, data):
                return True

    return False


def rec_lookup_dockerfile(current_dir):
    files = os.listdir(current_dir)

    has_sagemath = False
    has_dockerbuild = False
    has_jail_img = False
    if "Dockerfile" in files:
        has_dockerbuild = True
        has_sagemath = check_excluded_images(f"{current_dir}/Dockerfile")
        has_jail_img = add_pack_dockerfile(f"{current_dir}/Dockerfile")

    for dir in [f for f in files if os.path.isdir(f"{current_dir}/{f}")]:
        tmp_has_dockerbuild, tmp_has_jail_img, tmp_has_sagemath = rec_lookup_dockerfile(
            f"{current_dir}/{dir}")
        has_dockerbuild |= tmp_has_dockerbuild
        has_jail_img |= tmp_has_jail_img
        has_sagemath |= tmp_has_sagemath

    return has_dockerbuild, has_jail_img, has_sagemath


def remove_dir(path):
    shutil.rmtree(path)


def copy_dir(src, dst):
    shutil.copytree(src, dst, dirs_exist_ok=True)


def admin_file_exists(path):
    return os.path.exists(f"{path}/{os.getenv('DEFAULT_ADMINBOT_FILENAME')}")


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
        admin_bot_filename = os.getenv('DEFAULT_ADMINBOT_FILENAME')
        admin_file_path = f"{path}/{admin_bot_filename}"
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
                docker cp ../{admin_bot_filename} {admin_bot_api_container_name}:/backend/controllers
                docker cp ../{flag_path} {admin_bot_api_container_name}:/backend/controllers

                # Reload Docker container
                docker restart {admin_bot_api_container_name}
                """.format(flag_path=flag_path, admin_bot_filename=admin_bot_filename, admin_bot_api_container_name=os.getenv('ADMIN_BOT_API_CONTAINER_NAME')))
                f.write(code)

        with open(admin_file_path, 'w') as f:
            f.write(contents)


def insertIntoMongo(data, cat, chal, flag, hasDownloadableFiles):
    list = {
        "name": chal,
        "image": "diceCTF.png",
        "author": data["author"],
        "description": metaInfo[chal]['description'],
        "category": cat.capitalize(),
        "difficulty": metaInfo[chal]['difficulty'],
        "targets": "https://" + chal + ".mc.ax",
        "hasDownloadableFiles": hasDownloadableFiles,
        "solved": False
    }

    if "adminbot" in data:
        list["bot"] = f"https://{os.getenv('ADMIN_BOT_FRONTEND_URL')}"

    list["flag"] = flag.strip()

    scenariosCollection.insert_one(list)


def insertCustomScenarios(data):
    list = {
        "name": data["name"],
        "image": data["image"],
        "author": data["author"],
        "description": data['description'],
        "category": data['category'],
        "difficulty": data['difficulty'],
        "flag": data["flag"],
        "hasDownloadableFiles": data['hasDownloadableFiles'],
        "solved": False
        # "targets": "https://" + data['targets'] + ".mc.ax",
    }

    if "targets" in data:
        list["targets"] = data["targets"]
    if "adminbot" in data:
        list["bot"] = f"https://{os.getenv('ADMIN_BOT_FRONTEND_URL')}"

    scenariosCollection.insert_one(list)


def gatherDownloadFiles(path, provide, chal):
    dst_path = f"{path}/download"
    os.mkdir(dst_path)

    for file in provide:
        if isinstance(file, dict) and 'file' in file:
            src_path = f"{path}/{file['file']}"
        else:
            src_path = f"{path}/{file}"

        shutil.copy(src_path, dst_path)

    backend_path = f"{os.getcwd()}/../manager/backend/public/download/{chal}_download"
    # copy_dir(dst_path, backend_path)
    shutil.make_archive(backend_path, 'zip', dst_path)


def parse_challenge(cat, path, chal, has_jail_img):
    challenge_description_path = f"{path}/challenge.yaml" if os.path.exists(
        f"{path}/challenge.yaml") else f"{path}/challenge.yml"

    with open(challenge_description_path) as f:
        data = yaml.load(f, Loader=SafeLoader)

        if "containers" not in data:
            remove_dir(path)
            return

        hasDownloadableFiles = 'provide' in data
        if hasDownloadableFiles:
            gatherDownloadFiles(path, data['provide'], chal)

        if "file" in data["flag"]:
            with open(f"{path}/{data['flag']['file']}") as f:
                flag = f.read()
        else:
            flag = data["flag"]

        if connectToDB:
            insertIntoMongo(data, cat, chal, flag, hasDownloadableFiles)

        # vulnerables["flag"] = flag

        # Construct images
        images = []
        machines = []
        dns = []
        port_forwarding = []
        setup = []

        last_ip_byte = 50

        REVERSE_PROXY_CONTAINER_NAME, REVERSE_PROXY_IMAGE_NAME, REVERSE_PROXY_PATH, REVERSE_PROXY_PORT = itemgetter(
            'REVERSE_PROXY_CONTAINER_NAME', 'REVERSE_PROXY_IMAGE_NAME', 'REVERSE_PROXY_PATH', 'REVERSE_PROXY_PORT')(os.environ)
        DMZ_NET_NAME, EXTERNAL_NET_NAME = itemgetter(
            'DMZ_NET_NAME', 'EXTERNAL_NET_NAME')(os.environ)
        ATTACKER_MACHINE_CONTAINER_NAME, DNS_SERVER_CONTAINER_NAME, EDGE_ROUTER_CONTAINER_NAME = itemgetter(
            'ATTACKER_MACHINE_CONTAINER_NAME', 'DNS_SERVER_CONTAINER_NAME', 'EDGE_ROUTER_CONTAINER_NAME')(os.environ)
        REVERSE_PROXIES_GROUP, CUSTOM_MACHINES_GROUP = itemgetter(
            'REVERSE_PROXIES_GROUP', 'CUSTOM_MACHINES_GROUP')(os.environ)
        ADMIN_BOT_FRONTEND_PATH, ADMIN_BOT_API_PATH, ADMIN_BOT_API_IMAGE_NAME, ADMIN_BOT_FRONTEND_IMAGE_NAME, ADMIN_BOT_API_URL, ADMIN_BOT_FRONTEND_URL, ADMIN_BOT_API_CONTAINER_NAME, ADMIN_BOT_FRONTEND_CONTAINER_NAME, ADMIN_BOT_FRONTEND_PORT, ADMIN_BOT_API_PORT = itemgetter(
            'ADMIN_BOT_FRONTEND_PATH', 'ADMIN_BOT_API_PATH', 'ADMIN_BOT_API_IMAGE_NAME', 'ADMIN_BOT_FRONTEND_IMAGE_NAME', 'ADMIN_BOT_API_URL', 'ADMIN_BOT_FRONTEND_URL', 'ADMIN_BOT_API_CONTAINER_NAME', 'ADMIN_BOT_FRONTEND_CONTAINER_NAME', 'ADMIN_BOT_FRONTEND_PORT', 'ADMIN_BOT_API_PORT')(os.environ)

        # Reverse Proxy Image (ALWAYS needed)
        images.append({"name": REVERSE_PROXY_IMAGE_NAME,
                       "path": REVERSE_PROXY_PATH,
                       })

        # Reverse Proxy Machine (ALWAYS needed)
        # Optimistic approach because we only consider the first container as the one exposed by a domain.
        container_names = list(data["containers"].keys())
        first_container_name = container_names[0]
        reverse_proxy_vars = [{
            "domain": f"{chal}.mc.ax",
            "targets": [{
                "name": f"vuln_service_{chal}_{first_container_name}",
                "network": DMZ_NET_NAME,
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
                        "network": DMZ_NET_NAME
                    },
                    "external": {
                        "machine": f"vuln_service_{chal}_{container_names[idx]}",
                        "network": DMZ_NET_NAME
                    },
                })

        dns.append({
            "domain": f"{chal}.mc.ax",
            "internal": {
                "machine": f"vuln_service_{chal}_{first_container_name}",
                "network": DMZ_NET_NAME
            },
            "external": {
                "machine": EDGE_ROUTER_CONTAINER_NAME,
                "network": EXTERNAL_NET_NAME
            }
        })

        # Port Forwarding (ALWAYS needed)
        port_forwarding.append({
            "destination_port": int(REVERSE_PROXY_PORT),
            "to_machine": REVERSE_PROXY_CONTAINER_NAME,
            "to_network": DMZ_NET_NAME,
            "to_port": int(REVERSE_PROXY_PORT)
        })

        if admin_file_exists(path):
            # DNS
            dns.append({
                "domain": ADMIN_BOT_FRONTEND_URL,
                "internal": {
                    "machine": REVERSE_PROXY_CONTAINER_NAME,
                    "network": DMZ_NET_NAME
                },
                "external": {
                    "machine": EDGE_ROUTER_CONTAINER_NAME,
                    "network": EXTERNAL_NET_NAME
                }
            })

            dns.append({
                "domain": ADMIN_BOT_API_URL,
                "internal": {
                    "machine": REVERSE_PROXY_CONTAINER_NAME,
                    "network": DMZ_NET_NAME
                },
                "external": {
                    "machine": EDGE_ROUTER_CONTAINER_NAME,
                    "network": EXTERNAL_NET_NAME
                }
            })

            # Reverse Proxy
            reverse_proxy_vars.append({
                "domain": ADMIN_BOT_FRONTEND_URL,
                "targets": [{
                    "name": ADMIN_BOT_FRONTEND_CONTAINER_NAME,
                    "network": DMZ_NET_NAME,
                    "port": int(ADMIN_BOT_FRONTEND_PORT)
                }]
            })

            reverse_proxy_vars.append({
                "domain": ADMIN_BOT_API_URL,
                "targets": [{
                    "name": ADMIN_BOT_API_CONTAINER_NAME,
                    "network": DMZ_NET_NAME,
                    "port": int(ADMIN_BOT_API_PORT)
                }]
            })

            machines.append({
                "name": ADMIN_BOT_FRONTEND_CONTAINER_NAME,
                "image": ADMIN_BOT_FRONTEND_IMAGE_NAME,
                "group": [CUSTOM_MACHINES_GROUP],
                "dns": {
                    "name": DNS_SERVER_CONTAINER_NAME,
                    "network": DMZ_NET_NAME
                },
                "networks": [{
                    "name": DMZ_NET_NAME,
                    "ipv4_address": f"172.{{{{ networks.{DMZ_NET_NAME}.random_byte }}}}.0.42"
                }],
            })

            machines.append({
                "name": ADMIN_BOT_API_CONTAINER_NAME,
                "image": ADMIN_BOT_API_IMAGE_NAME,
                "group": [CUSTOM_MACHINES_GROUP],
                "dns": {
                    "name": DNS_SERVER_CONTAINER_NAME,
                    "network": DMZ_NET_NAME
                },
                "networks": [{
                    "name": DMZ_NET_NAME,
                    "ipv4_address": f"172.{{{{ networks.{DMZ_NET_NAME}.random_byte }}}}.0.43"
                }],
            })

            # Images
            images.append({
                "name": ADMIN_BOT_API_IMAGE_NAME,
                "path": ADMIN_BOT_API_PATH,
            })

            images.append({
                "name": ADMIN_BOT_FRONTEND_IMAGE_NAME,
                "path": ADMIN_BOT_FRONTEND_PATH,
                "args": {
                    "api": ADMIN_BOT_API_URL
                }
            })

            # Setup
            setup.append({
                "name": "localhost",
                "setup": "{{ playbook_dir }}" + f"/scenarios/{chal}/setup/"
            })

        # Import CA
        setup.append({
            "name": ATTACKER_MACHINE_CONTAINER_NAME,
            "setup": "{{ playbook_dir }}" + f"/scenarios/{chal}/attacker_machine_setup/*.j2"
        })

        copy_dir(f"{parent_dir}/attacker_machine_setup",
                 f"{path}/attacker_machine_setup")

        # Machines
        machines.append({
            "name": REVERSE_PROXY_CONTAINER_NAME,
            "image": REVERSE_PROXY_IMAGE_NAME,
            "group": [REVERSE_PROXIES_GROUP],
            "dns": {
                "name": DNS_SERVER_CONTAINER_NAME,
                "network": DMZ_NET_NAME
            },
            "networks": [{
                "name": DMZ_NET_NAME,
                "ipv4_address": f"172.{{{{ networks.{DMZ_NET_NAME}.random_byte }}}}.0.40"
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

            img_args = {k: v for k, v in container_info['build']['args'].items(
            )} if 'args' in container_info['build'] else {}

            if chal in customized_scenario_confs:
                img_args |= customized_scenario_confs[chal]['args']

            images.append({"name": f"{chal}_{container_name}",
                           "path": f"scenarios/{build_path}",
                           "args": img_args
                           })

            # Ports, Environment Vars, Flags

            # Machines
            machines.append({"name": f"vuln_service_{chal}_{container_name}",
                             "image": images[-1]["name"],
                             "group": [CUSTOM_MACHINES_GROUP],
                             "dns": {"name": DNS_SERVER_CONTAINER_NAME, "network": DMZ_NET_NAME},
                             "exposed_ports": container_info["ports"] if "ports" in container_info else [],
                             "env": container_info["environment"] if "environment" in container_info else {},
                             "networks": [{
                                 "name": DMZ_NET_NAME,
                                 "ipv4_address": f"172.{{{{ networks.{DMZ_NET_NAME}.random_byte }}}}.0." + f"{last_ip_byte}"
                             }],
                             "privileged": has_jail_img
                             })

            last_ip_byte += 1

        write_vars(path, images, machines, dns, port_forwarding, setup)
        copy_dir(path, os.path.join(os.getcwd(), "..", "scenarios", chal))


def lookup_challenges(current_dir):
    categories = os.listdir(current_dir)

    if connectToDB:
        custom_scenarios = os.getenv('OWN_SCENARIOS').split(',')

        for scn in custom_scenarios:
            insertCustomScenarios(metaInfo[scn])

    for cat in [f for f in categories if os.path.isdir(f"{current_dir}/{f}")]:
        category_path = f"{current_dir}/{cat}"
        challenges = os.listdir(category_path)
        for chal in [f for f in challenges if os.path.isdir(f"{current_dir}/{cat}/{f}")]:
            challenge_path = f"{current_dir}/{cat}/{chal}"
            has_docker_build, has_jail_img, has_sagemath = rec_lookup_dockerfile(
                challenge_path)

            # Ignore scenarios that don't use Docker or in which the Docker image is Sagemath
            if not has_docker_build or has_sagemath or chal in os.getenv('EXCLUDED_IMAGES_AND_CHALLENGES'):
                remove_dir(challenge_path)
            else:
                parse_admin_file(challenge_path)
                parse_challenge(cat, challenge_path, chal, has_jail_img)

            # print(
            #     f"Category[{cat}] | Challenge[{chal}] => {has_docker_build}")


github_repositories = [
    {
        "url": "https://github.com/dicegang/dicectf-2023-challenges.git",
        "name": "dicectf-2023-challenges"
    }
]

parent_dir = os.getcwd()
metaInfo = None
connectToDB = True

try:
    dbClient = pymongo.MongoClient(
        f"mongodb://{os.getenv('MONGODB_USERNAME')}:{os.getenv('MONGODB_PASSWORD')}@{os.getenv('MONGODB_HOSTNAME')}:{os.getenv('MONGODB_PORT')}/?authMechanism=DEFAULT")
    dbClient.server_info()

    db = dbClient["DB"]
    scenariosCollection = db["scenarios"]
    scenariosCollection.drop()

    with open('scenarios.json') as f:
        metaInfo = json.load(f)
except Exception as e:
    connectToDB = False
    print("Connection Error to MongoDB.")

for repo in github_repositories:
    repo_path = "{}/{}".format(parent_dir, repo["name"])

    if os.path.exists(repo_path):
        remove_dir(repo_path)

    git.Git(".").clone(repo["url"])
    remove_dir(f"{repo_path}/.git")
    lookup_challenges(repo_path)
    remove_dir(f"{repo_path}")
