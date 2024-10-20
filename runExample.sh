#!/bin/zsh
# will be run automatically as part of the command `npx @hauke5/dialog`
green=\\x1b[32m
clear=\\x1b[0m
bold=\\x1b[1m

git clone https://github.com/Hauke5/DialogExample.git 
cd DialogExample
npm i
echo "$green$bold point a browser at http://localhost:3001/dialog"
npm run dev