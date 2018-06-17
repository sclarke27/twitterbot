#!/bin/sh

HOME=/home/pi/twitterbot

echo "Image capture started"
while [ true ]; do
	# \javascript\httpServer\views\assets\images\plantMon\RaspiPlant2.jpg
	HOME_DIR=/home/pi/twitterbot
	PIC_DIR=$HOME_DIR/javascript/httpServer/views/assets/images/plantMon
	FILE_NAME=RaspiPlant2
	FILE_TYPE=jpg

	#capture image from webcam
	raspistill -o $PIC_DIR/$FILE_NAME.$FILE_TYPE -w 1280 -h 1024 -n -a 12
	cp $PIC_DIR/$FILE_NAME.$FILE_TYPE $PIC_DIR/$FILE_NAME-card.$FILE_TYPE
	
	# DATE=`date +%s`
	# HOME_DIR=/home/pi/twitterbot
	# CAP_DIR=$HOME_DIR/captures/plant

	# cp $CAP_DIR/image.jpg $CAP_DIR/plant1Latest.jpg 
	# mv $CAP_DIR/image.jpg $CAP_DIR/$DATE.jpg
	# mv $CAP_DIR/plant1Latest.jpg $HOME_DIR/httpServer/views/assets/plant1Latest.jpg
	
	sleep 60
done
