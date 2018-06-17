#!/bin/sh

path=$(pwd)

(cd $path;
    echo 'stop node'
    sudo killall node)