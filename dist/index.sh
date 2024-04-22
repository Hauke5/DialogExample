#!/bin/bash
echo ">>>"$dirname
echo ">>>>"$(dirname $0)

cp -R $(dirname $0)/../@hauke5/dialog/dist/example/* ./dialog/
# cp -R $(dirname $0)/../@hauke5/dialog/dist/lib ./


echo "type 'npm run dev', then go to htp://localhost:3000/examples/dialog"