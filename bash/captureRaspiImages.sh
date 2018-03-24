#!/bin/sh

HOME=/home/pi/twitterbot

echo "Image capture started"
while [ true ]; do
	#capture image from webcam
	raspistill -o /home/pi/twitterbot/captures/plant/image.jpg -w 1280 -h 1024 -n -a 12
	
	
	DATE=`date +%s`
	HOME_DIR=/home/pi/twitterbot
	CAP_DIR=$HOME_DIR/captures/plant

	cp $CAP_DIR/image.jpg $CAP_DIR/plant1Latest.jpg 
	mv $CAP_DIR/image.jpg $CAP_DIR/$DATE.jpg
	mv $CAP_DIR/plant1Latest.jpg $HOME_DIR/httpServer/views/assets/plant1Latest.jpg

	sleep 30
done
