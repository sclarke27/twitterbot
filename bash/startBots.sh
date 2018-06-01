#!/bin/sh


(cd /home/pi/swim-sensor-monitor-demo;
    echo 'build swim'
    cd java/
	gradle build
	echo 'untar swim'
    rm -rf dist/
    mkdir dist/
	tar -xf build/distributions/java.tar -C dist/
	echo 'start swim'
    sudo chmod +x dist/java/bin/java
    nohup ./dist/java/bin/java &)


(cd;
    echo 'start node'
    cd twitterbot/
    nohup npm start &)

# echo 'launch chrome in kiosk mode'
DISPLAY=:0 chromium-browser --kiosk http://75.50.82.129:8090/plants/plant1 &
echo 'done'
