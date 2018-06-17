#!/bin/sh

path=$(pwd)

(cd $path;
    echo 'start node'
    cd javascript/
    nohup npm start "$@" &)