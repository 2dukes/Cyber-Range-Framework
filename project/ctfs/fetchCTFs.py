import git
import os
import shutil


def rec_lookup_dockerfile(current_dir):
    files = os.listdir(current_dir)

    if ("Dockerfile" in files):
        return True

    flag = False
    for dir in [f for f in files if os.path.isdir(f"{current_dir}/{f}")]:
        flag = rec_lookup_dockerfile(f"{current_dir}/{dir}")
        if (flag):
            break

    return flag


def remove_dir(path):
    shutil.rmtree(path)


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

            print(
                f"Category[{cat}] | Challenge[{chal}] => {has_docker_build}")


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
