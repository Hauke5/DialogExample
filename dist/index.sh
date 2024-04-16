#!/bin/bash

npx @hauke5/nextjs-utils@latest
cp -R $(dirname $0)/../@hauke5/dialog/dist/app ./
cp -R $(dirname $0)/../@hauke5/dialog/dist/lib ./

echo "type `npm run dev`, then go to htp://localhost:3000/examples/dialog