import git
import os
import re
import shutil
import yaml
from yaml.loader import SafeLoader


def rec_lookup_dockerfile(current_dir):
    files = os.listdir(current_dir)

    if "Dockerfile" in files:
        return True

    flag = False
    for dir in [f for f in files if os.path.isdir(f"{current_dir}/{f}")]:
        flag = rec_lookup_dockerfile(f"{current_dir}/{dir}")
        if flag:
            break

    return flag


def remove_dir(path):
    shutil.rmtree(path)

def parse_admin_file(path):
    if os.path.exists(f"{path}/adminbot.js"):
        admin_file_path = f"{path}/adminbot.js"
        with open(admin_file_path) as f:
            contents = f.read()

            var = "flag"
            file = "flag"
            if not re.search("import flag from './flag.txt'", contents):
                var = "token"
                file = "admin"

            sub_flag_string = "const fs = require('fs');\n" \
                "const path = require('path');\n" \
                "const {var} = fs.readFileSync(path.resolve(__dirname, '{file}.txt'), 'utf8');".format(
                    var=var, file=file)

            # Import flag
            contents = re.sub("import .* from './.*.txt'",
                              sub_flag_string, contents)

            # Module export
            contents = re.sub("export default", "module.exports =", contents)

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

        vulnerables["flag"] = flag

        # Construct images
        images = vulnerables["images"]
        machines = vulnerables["machines"]

        last_ip_byte = 30

        for container_name in data["containers"].keys():
            container_info = data["containers"][container_name]

            # Images
            images = {"name": f"{chal}_{container_name}",
                          "scenario": f"{chal}/{container_info['build']}"}

            # Ports, Environment Vars, Flags

            # Machines
            machines = {"name": f"vuln_service_{chal}",
                            "image": images[-1]["name"],
                             "group": "vuln_machines",
                             "dns_server": True,
                             "exposed_ports": container_info["ports"] if "ports" in container_info else [],
                             "env": container_info["environment"] if "environment" in container_info else {},
                             "networks": [{
                                 "name": "dmz_net",
                                 "ipv4_address": f"172.{{ general.random_byte | int - 5 }}.0.{last_ip_byte}"
                             }]
                             }

            last_ip_byte += 1


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
                parse_challenge(challenge_path, chal)
                parse_admin_file(challenge_path)

            # print(
            #     f"Category[{cat}] | Challenge[{chal}] => {has_docker_build}")

    print(vulnerables)


vulnerables = {"images": [], "machines": []}

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
