#!/bin/bash
echo $(dirname $0) # should show ~/.npm/_npx/.../node_modules/.bin

Bundle="dialog"
mkdir -p ./$Bundle
cd ./$Bundle
cp -R $(dirname $0)/../@hauke5/$Bundle/dist/example/* ./
cp -R $(dirname $0)/../@hauke5/$Bundle/dist/lib ./

pwd
npm i
cp -R ./node_modules/@hauke5/utils/dist/lib ./
cp -R ./node_modules/@hauke5/nextjs-utils/dist/lib ./
npm run dev
echo "type 'cd ./$Bundle', then 'npm run dev', then point a browser to htp://localhost:3000/examples/"$bundle