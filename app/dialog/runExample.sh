#!/bin/zsh
# call from the runtime ./Dialog folder as:
# ./node_modules/@hauke5/dialog/runExample.sh

Bundle="Dialog"
bundle="dialog"
dirName=$(dirname $0)

echo "NODE_ENV=$NODE_ENV"

pwd=$(pwd)
npmV=$(npm pkg get version)

echo "npm=$npmV, cwd=$pwd"

appDir="./node_modules/@hauke5/$bundle/"
echo "copying Dialog from $appDir to ./"
cp -R $appDir ./

npm i
npm run build
