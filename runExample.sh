#!/bin/zsh
# call from the runtime ./Dialog folder as:
# ./node_modules/@hauke5/dialog/runExample.sh

Bundle="Dialog"
bundle="dialog"
dirName=$(dirname $0)

echo "NODE_ENV=$NODE_ENV"

pwd=$(pwd)
echo "cwd = $cwd"
echo "copying ./$dirName to ./"

# copy core dialog app
cp -R $dirName/ ./
# copy util stuff
cp -R $dirName/../util/ ./

# npm i
# cp -R ./node_modules/@hauke5/utils/lib ./
npm run dev
# echo "point a browser to http://localhost:3001/example/"
# npm start
