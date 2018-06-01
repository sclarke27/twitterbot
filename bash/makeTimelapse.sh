#!/bin/sh
DATE=`date +%s`
HOME_DIR=/home/pi/twitterbot
CAP_DIR=$HOME_DIR/captures/plant
NEW_DIR=$CAP_DIR/$DATE

# stop swim service to prevent it from being cpu bound
cd $HOME_DIR
./bash/stopBots.sh

mkdir $NEW_DIR
mv $CAP_DIR/*.jpg $NEW_DIR/

# make timelapse
ffmpeg -framerate 30 -pattern_type glob -i "$NEW_DIR/*.jpg" -filter "minterpolate='mi_mode=blend'" -vcodec libx264 $NEW_DIR/$DATE.mp4

# restart swim service
# nohup /home/pi/swim-academy/raspi/services/services/bin/services &
./bash/startBots.sh
 