#!/usr/bin/env python3
#
# Dirty and quick script for parsing URLs to macros, requires PyGithub

import re
import fileinput
from github import Github

URL_REGEX = r'https?://github\.com/([\w_-]+/[\w_-]+)/(\w+)/(\d+)'
AUTH = 'TODO'


def get_kind(base: str, state: str) -> str:
    if base == 'pull':
        return 'pr'
    else:
        return 'issue'


g = Github(AUTH)

for url in fileinput.input():
    matches = re.search(URL_REGEX, url)
    if matches is None:
        print(f"`{url}` isn't an URL, skipping...")
        continue

    repo_name = matches.group(1)
    kind_base = matches.group(2)
    number = int(matches.group(3))

    repo = g.get_repo(repo_name)
    issue = repo.get_issue(number=number)
    kind = get_kind(kind_base, issue.state)
    print(f"{{{{< gh \"{kind}\" \"{repo_name}\" {number} \"{issue.title}\" >}}}}")
