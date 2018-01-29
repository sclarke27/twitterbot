#!/bin/sh
DATE=`date +%s`
HOME_DIR=/home/pi/twitterbot
CAP_DIR=$HOME_DIR/captures/plant

cp $CAP_DIR/image.jpg $CAP_DIR/plant1Latest.jpg 
mv $CAP_DIR/image.jpg $CAP_DIR/$DATE.jpg
mv $CAP_DIR/plant1Latest.jpg $HOME_DIR/httpServer/views/assets/plant1Latest.jpg

