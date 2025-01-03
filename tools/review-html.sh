#!/usr/bin/env bash

errhandler() {
    errorCode=$?
    echo ">> Error $errorCode in line ${BASH_LINENO[0]}: $BASH_COMMAND"
    exit $errorCode
}
trap errhandler ERR

clone_url=$(git config --get remote.origin.url)
tmp_dir=/tmp/nullderef-review-html
original_dir=$PWD

echo ">> Building local site"
npm install
npm run build

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
npm install
npm run build

echo ">> Showing differences between $tmp_dir and $original_dir"
diff \
  --brief \
  --recursive \
  --no-dereference \
  --new-file \
  --no-ignore-file-name-case \
  "${tmp_dir}/_site" "${original_dir}/_site" \
  | grep -v '^$' \
  | awk '{ print "git diff", $2, $4 }'
