#!/bin/sh


(cd;
    echo 'start swim'
    cd swim-academy/raspi/services/
    nohup ./services/bin/services &)


(cd;
    echo 'start node'
    cd twitterbot/
    nohup npm start &)

echo 'done'


