#!/bin/sh

path=$(pwd)

rm java/nohup.out
rm javascript/nohup.out

echo 'call stop all script'
${path}/bin/stopAll.sh "$@"

rm -rf /tmp/sensorMonitorDemo

echo 'call start all script'
${path}/bin/startAll.sh "$@"
