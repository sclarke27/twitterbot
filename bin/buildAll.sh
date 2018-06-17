#!/bin/sh

path=$(pwd)

echo 'call build node script'
${path}/bin/buildNode.sh "$@"

echo 'call build swim script'
${path}/bin/buildSwim.sh "$@"
