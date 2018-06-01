#!/bin/sh

echo 'killing chrome processes'
sudo killall chromium-browser

echo 'killing all java processes'
sudo killall java

echo 'killing all node processes'
sudo killall node

echo 'done'
