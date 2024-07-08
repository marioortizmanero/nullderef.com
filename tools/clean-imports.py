import re
import sys
from dataclasses import dataclass


@dataclass
class BibliographyEntry:
    name: str
    content: list[str]


def deduplicate_maintaining_order[T](items: list[T]) -> list[T]:
    return list(dict.fromkeys(items))


def find_references(content: str) -> list[str]:
    references = re.findall(r'<<([a-zA-Z0-9-_]+)>>', content)
    return deduplicate_maintaining_order(references)


def extract_bibliography(content: str) -> list[BibliographyEntry]:
    lines = content.splitlines()

    bibliography_start = None
    for i, line in enumerate(lines):
        if line.strip() == r'[bibliography]':
            bibliography_start = i
            break

    if bibliography_start is None:
        raise Exception("Couldn't find start of bibliography")

    # We have a stack of entries
    entries = []
    for line in lines[bibliography_start:]:
        entry_search = re.search(r'^- \[\[\[([a-zA-Z0-9-_]+),\s*(\d+)\]\]\]', line)

        if entry_search:
            entry_name = entry_search.group(1)
            entry = BibliographyEntry(name=entry_name, content=[line])
            entries.append(entry)
            continue

        # Preceding lines to the first entry are ignored
        if len(entries) > 0:
            entries[-1].content.append(line)

    return entries


def sort_bibliography(entries: list[BibliographyEntry], refs: list[str]) -> list[str]:
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
            r'^(- \[\[\[[a-zA-Z0-9-_]+,)\s*(\d+)(\]\]\].*)',
            f"\\1 {i + 1}\\3",
            entry.content[0],
        )

    return sorted_entries


def main(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    references = find_references(content)
    bibliography = extract_bibliography(content)
    sorted_bibliography = sort_bibliography(bibliography, references)

    for entry in sorted_bibliography:
        for line in entry.content:
            print(line)


if __name__ == "__main__":
    file_path = sys.argv[1]
    main(file_path)
