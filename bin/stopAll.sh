#!/bin/sh

path=$(pwd)

echo 'killing chrome processes'
sudo killall chromium-browser

echo 'call stop node script'
${path}/bin/stopNode.sh

echo 'call stop swim script'
${path}/bin/stopSwim.sh