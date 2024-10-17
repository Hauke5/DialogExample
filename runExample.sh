#!/bin/zsh
# cwd should be the ./Dialog folder

Bundle="Dialog"
bundle="dialog"
dirName=$(dirname $0)

echo "NODE_ENV=$NODE_ENV"

pwd=$(pwd)
echo "cwd = $cwd"
echo "copying ./$dirName to ./"
cp -R $dirName/ ./

# npm i
# cp -R ./node_modules/@hauke5/utils/lib ./
npm run dev
# echo "point a browser to http://localhost:3001/example/"
# npm start
