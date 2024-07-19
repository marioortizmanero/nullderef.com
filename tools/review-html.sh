#!/usr/bin/env bash

clone_url=$(git config --get remote.origin.url)
tmp_dir=/tmp/nullderef-review-html
original_dir=$PWD

echo ">> Building local site"
hugo

echo ">> Building reference site"
mkdir -p "$tmp_dir"
cd "$tmp_dir" || exit 1
if ! [ -d "${tmp_dir}/.git" ]; then
  git clone "$clone_url" "$tmp_dir"
fi
git checkout master
git pull
git submodule init
git submodule update
hugo

echo ">> Showing differences between $original_dir and $tmp_dir"
diff \
  --brief \
  --recursive \
  --no-dereference \
  --new-file \
  --no-ignore-file-name-case \
  "${tmp_dir}/public" "${original_dir}/public" \
  | grep -v '^$' \
  | awk '{ print "git diff", $2, $4 }'
