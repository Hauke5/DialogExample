#!/bin/bash
# $(dirname $0) should point to ~/.npm/_npx/.../node_modules/.bin

Bundle="Dialog"
bundle="dialog"
mkdir -p ./$Bundle
cd ./$Bundle
cp -R $(dirname $0)/../@hauke5/$bundle/ ./

npm i
cp -R ./node_modules/@hauke5/utils/lib ./
cp -R ./node_modules/@hauke5/nextjs-utils/lib ./
echo "point a browser to http://localhost:3000/examples/"$Bundle
npm run dev
