"""
Quick script to automatically reorder and validate AsciiDoc references. The final list
will be printed to stdout.
"""

from dataclasses import dataclass
from typing import Optional
import re
import requests
import logging
import sys
import time


REGEX_BIBLIOGRAPHY_ENTRY_MATCH_NAME = r'^- \[\[\[([a-zA-Z0-9-_]+),\s*(\d+)\]\]\]'
REGEX_BIBLIOGRAPHY_ENTRY_MATCH_LINK =  r'(https://.*)\['
REGEX_BIBLIOGRAPHY_ENTRY_REPLACE_NUM = r'^(- \[\[\[[a-zA-Z0-9-_]+,)\s*(\d+)(\]\]\].*)'
REGEX_BIBLIOGRAPHY_REF = r'<<([a-zA-Z0-9-_]+)>>'
BIBLIOGRAPHY_TAG = "[bibliography]"
CHECK_LINK_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Priority": "u=1",
    "TE": "trailers"
}

logger = logging.getLogger(__name__)
logging.basicConfig(format="[%(levelname)s] %(message)s", level=logging.INFO)


@dataclass
class BibliographyEntry:
    name: str
    content: list[str]
    link: str | None = None


def deduplicate_maintaining_order[T](items: list[T]) -> list[T]:
    return list(dict.fromkeys(items))


def find_references(content: str) -> list[str]:
    logger.info("Finding references to bibliography")
    references = re.findall(REGEX_BIBLIOGRAPHY_REF, content)
    references_dedup = deduplicate_maintaining_order(references)
    logger.info(f"Found {len(references_dedup)} unique references")
    return references_dedup


def extract_bibliography(content: str) -> list[BibliographyEntry]:
    logger.info("Extracting bibliography entries")
    lines = content.splitlines()

    bibliography_start = None
    for i, line in enumerate(lines):
        if line.strip() == BIBLIOGRAPHY_TAG:
            bibliography_start = i
            break
    if bibliography_start is None:
        raise Exception("Couldn't find start of bibliography")

    # We have a stack of entries. We will collect the contents of the current entry
    # before the next one starts.
    entries = []
    for line in lines[bibliography_start:]:
        entry_search = re.search(REGEX_BIBLIOGRAPHY_ENTRY_MATCH_NAME, line)

        if entry_search:
            entry_name = entry_search.group(1)
            entry = BibliographyEntry(name=entry_name, content=[line])
            entries.append(entry)
        elif len(entries) > 0: # Preceding lines to the first entry are ignored
            entries[-1].content.append(line)

        link_search = re.search(REGEX_BIBLIOGRAPHY_ENTRY_MATCH_LINK, line)
        if len(entries) > 0 and link_search:
            entries[-1].link = link_search.group(1)

    logger.info(f"Found {len(entries)} entries")
    return entries


def check_bibliography_links_exist(bibliography: list[BibliographyEntry]) -> None:
    logger.info("Checking existence of bibliography links")
    for i, entry in enumerate(bibliography):
        if entry.link is None:
            logger.warning(f"Link not found for entry: {entry.name}")
            continue

        logger.info(f"[{i + 1}/{len(bibliography)}] {entry.link}")
        r = requests.get(entry.link, headers=CHECK_LINK_HEADERS)
        try:
            r.raise_for_status()
        except Exception as e:
            logger.error(f"Failure, please check manually: {e}")

    logger.info("Checked existence of all bibliography links")


def check_bibliography_links_have_archive(
    bibliography: list[BibliographyEntry]
) -> None:
    logger.info("Checking archives of bibliography links")
    for i, entry in enumerate(bibliography):
        if entry.link is None:
            logger.warning(f"Link not found for entry: {entry.name}")
            continue

        logger.info(f"[{i + 1}/{len(bibliography)}] {entry.link}")
        # Archive.org's API doesn't seem to work right now
        #r = requests.get("https://archive.org/wayback/available", params={
        #    "url": entry.link,
        #})
        #if not r.json()["archived_snapshots"]["closest"]["available"]:
        #    logger.error("No archive found")
        r = requests.get(f"https://archive.is/newest/{entry.link}", headers=CHECK_LINK_HEADERS)
        try:
            r.raise_for_status()
        except Exception as e:
            logger.error(f"No archive found: {e}")

    logger.info("Checked archives of all bibliography links")


def sort_bibliography(entries: list[BibliographyEntry], refs: list[str]) -> list[str]:
    logger.info("Sorting bibliography")

    # No missing keys in either collection.
    # We use two exceptions for better error messages.
    entries_keys = set(e.name for e in entries)
    missing_entries = entries_keys - set(refs)
    if len(missing_entries) > 0:
        raise Exception(f"Entries without references found: {missing_entries}")
    missing_refs = set(refs) - entries_keys
    if len(missing_refs) > 0:
        raise Exception(f"References without entries found: {missing_refs}")

    # First sorting the order itself
    ref_order = {ref: idx for idx, ref in enumerate(refs)}
    sorted_entries = sorted(entries, key=lambda entry: ref_order[entry.name])

    # Then, updating the numbering
    for i, entry in enumerate(sorted_entries):
        entry.content[0] = re.sub(
            REGEX_BIBLIOGRAPHY_ENTRY_REPLACE_NUM,
            f"\\1 {i + 1}\\3",
            entry.content[0],
        )

    logger.info("Sorted bibliography")
    return sorted_entries


def main(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    references = find_references(content)
    bibliography = extract_bibliography(content)
    check_bibliography_links_have_archive(bibliography)
    check_bibliography_links_exist(bibliography)
    sorted_bibliography = sort_bibliography(bibliography, references)

    for entry in sorted_bibliography:
        for line in entry.content:
            print(line)


if __name__ == "__main__":
    file_path = sys.argv[1]
    main(file_path)
