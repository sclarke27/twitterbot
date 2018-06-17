#!/bin/sh

path=$(pwd)

(cd $path;
    echo 'build swim'
    cd java/
	gradle build -P"$@"
	echo 'untar swim'
    rm -rf dist/
    mkdir dist/
	tar -xf build/distributions/java.tar -C dist/)