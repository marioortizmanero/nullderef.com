# Taken from https://github.com/facebook/docusaurus/issues/9715
fd -e svg -0 | xargs -0 -P $(nproc) -n 10 svgo
