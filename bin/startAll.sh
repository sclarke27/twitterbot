#!/bin/sh

path=$(pwd)

echo 'call start swim script'
${path}/bin/startSwim.sh "$@"

echo 'call start node script'
${path}/bin/startNode.sh "$@"

#echo 'launch chrome in kiosk mode'
#DISPLAY=:0 chromium-browser --kiosk http://127.0.0.1:8080/plantMon &
echo 'done'
