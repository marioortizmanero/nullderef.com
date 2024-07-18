#!/usr/bin/env bash

clone_url=$(git config --get remote.origin.url)
tmp_dir=$(mktemp -d)
original_dir=$PWD

echo ">> Building local site"
hugo

echo ">> Building reference site"
cd "$tmp_dir" || exit 1
git clone "$clone_url" "$tmp_dir"
git submodule init
git submodule update
hugo

echo ">> Showing differences"
diff --color=always "${original_dir}/public" "${tmp_dir}/public" | less -R

rm -rf "$tmp_dir"
