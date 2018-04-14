#!/bin/sh


(cd;
    echo 'build swim'
    cd swim-academy/raspi/services/
	gradle build
	echo 'untar swim'
	tar -xf build/distributions/services.tar
	echo 'start swim'
    nohup ./services/bin/services &)


(cd;
    echo 'start node'
    cd twitterbot/
    nohup npm start &)

echo 'launch chrome in kiosk mode'
DISPLAY=:0 chromium-browser --kiosk http://127.0.0.1:8080 &
echo 'done'
