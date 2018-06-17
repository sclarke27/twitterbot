#!/usr/bin/env bash

node=${1}
usr=${user:-swim}
pwd=${2}
project=${project:-sensor-monitor-demo-1.0}

#sensor.resolution
#device.name ... RaspiPlant11|192.168.0.130:8080
#device.host.uri
#aggregate.host.uri
#serial.port
#device.port
#swim.config

declare -A ip=(
  [11]="192.168.0.130"
)
declare -A config=(
  [11]="'java.vm':'-Xmx256m -Ddevice.name=RaspiPlant${node}\\\\\\\|${ip[${node}]}:8080 -Ddevice.host.uri=${ip[${node}]} -Daggregate.host.uri=ws://192.168.0.160:5620 -Dsensor.resolution=30000'"
)

hash swimsh 2>/dev/null || {
  curl -o getswimsh http://192.168.206.202:8080/swimsh/latest-ea/getswimsh && bash getswimsh
  export PATH=/usr/local/share/swim/bin:$PATH
}

swimsh uninstall host=${ip[${node}]} user=${usr} password=${pwd}
(export SSHPASS=${pwd}
  sshpass -e ssh -qtt ${usr}@${ip[${node}]} bash -c "'killall java'"
)
SWIM_VMARGS="-Xmx256m" swimsh install \
  buoy=http://192.168.206.202:8080/sensor-monitor-demo/latest-ea/sensorMonitorDemo-1.2.0.20180515224600-SNAPSHOT.buoy \
  configuration="{${config[${node}]}}" linger=7 host=${ip[${node}]} user=${usr} password=${pwd}

if [ ! -f ${project}.zip ]; then
  curl -o ${project}.zip http://192.168.206.202:8080/sensor-monitor-demo/1.0/1.0/${project}.zip
fi

# todo: install sshpass
hash sshpass 2>/dev/null || {
  brew install sshpass
}

(export SSHPASS=${pwd}
  sshpass -e ssh -qtt ${usr}@${ip[${node}]} bash -c "'
killall npm
killall node
rm -rf s ${project}.zip config javascript
'"
  sshpass -e scp ${project}.zip ${usr}@${ip[${node}]}:
  sshpass -e ssh -qtt ${usr}@${ip[${node}]} bash -c "'
unzip ${project}.zip
cp config/node/node/* config/node
rm -rf javascript/node_modules
(cd javascript; npm install)
'"
  sshpass -e ssh -nf ${usr}@${ip[${node}]} "sh -c 'cd javascript && nohup npm start config=raspi${node} > /dev/null 2>&1 &'"
)
