#!/bin/sh

path=$(pwd)

(cd $path;
    echo 'start swim'
    cd java/
    rm nohup.out
    nohup ./dist/java/bin/java -P"$@" &)
