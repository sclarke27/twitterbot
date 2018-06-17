#!/bin/sh

path=$(pwd)

(cd $path;
    echo 'do npm install'
    (cd javascript
	npm install))
# fixme: include version from package.json
    # zip -r swim_sensor_monitor_demo-1.0.0.zip ./javascript/)
