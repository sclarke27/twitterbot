#!/bin/sh
DATE=`date +%s`
HOME_DIR=/home/pi/twitterbot
CAP_DIR=$HOME_DIR/captures/plant
NEW_DIR=$CAP_DIR/$DATE

mkdir $NEW_DIR
mv $CAP_DIR/*.jpg $NEW_DIR/

#make timelapse
ffmpeg -framerate 30 -pattern_type glob -i "$NEW_DIR/*.jpg" -filter "minterpolate='mi_mode=mci'" -vcodec libx264 $NEW_DIR/timelapse.mp4

 