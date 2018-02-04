#!/bin/sh

HOME=/home/pi/twitterbot
cd $HOME/captures/dslr
gphoto2 --capture-image-and-download --filename=%y%m%d%H%M%S.%C --interval=30