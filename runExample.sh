#!/bin/zsh
# cwd should be the ./Dialog folder

Bundle="Dialog"
bundle="dialog"
dirName=$(dirname $0)

env

echo "running '$0' from $dirName"

cp -R $dirName/ ./

# npm i
# cp -R ./node_modules/@hauke5/utils/lib ./
npm run build
# echo "point a browser to http://localhost:3001/example/"
# npm start
