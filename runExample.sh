#!/bin/zsh
# $(dirname $0) should point to ~/.npm/_npx/.../node_modules/.bin

Bundle="Dialog"
bundle="dialog"
mkdir -p ./$Bundle
cd ./$Bundle

echo "running from '$0'"

cp -R $(dirname $0)/../@hauke5/$bundle/ ./

npm i
cp -R ./node_modules/@hauke5/utils/lib ./
npm run build
echo "point a browser to http://localhost:3001/example/"
npm start
./