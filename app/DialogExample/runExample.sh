#!/bin/zsh
# will be run automatically as part of the command `npx @hauke5/dialog`
green=\\x1b[32m
clear=\\x1b[0m
bold=\\x1b[1m

echo "param 0 = $0"
echo "param 1 = $1"
echo "param 2 = $2"
echo "param 3 = $3"
echo "param 4 = $4"
git clone https://github.com/Hauke5/DialogExample.git 
cd DialogExample
mkdir data
npm i
echo "$green$bold point a browser at http://localhost:3001/DialogExample"
npm run dev