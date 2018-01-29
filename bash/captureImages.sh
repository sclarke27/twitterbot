#!/bin/sh

HOME=/home/pi/twitterbot

echo $HOME/bash/fswebcam.conf

#capture image from webcam
fswebcam -b -c $HOME/bash/fswebcam.conf --exec $HOME/bash/rename.sh

echo "Image capture started"
