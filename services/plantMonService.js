const BaseService = require('./baseService');
const ArduinoBoard = require('../modules/ArduinoBoard');
const sense = require("sense-hat-led");
const util = require('util') 
const nodeimu  = require('nodeimu'); 
const IMU = new nodeimu.IMU(); 
const senseJoystick = require('sense-joystick');

class PlantMonService extends BaseService {


    constructor(serviceConfig, db, httpServer, showDebug = false) {
        super(serviceConfig, db, httpServer, showDebug);
        this.arduino = new ArduinoBoard(false);

        this.dataValueCache = {};
            
    }

    start() {
        super.start();
        if (this.showDebug) {
            console.info(`[PlantMonService] start baud: ${this.config.baud}`);
        }
    }

    onSerialData(newData) {
        try {
            const sensorData = JSON.parse(newData);
            if (this.showDebug) {
                console.info('[PlantMonService]', sensorData.soil, sensorData.light, sensorData.temp);
            }
            const updateData = {};
            const incomingData = {
                soil: sensorData.soil,
                light: sensorData.light,
                temperature: sensorData.temp
            };

            for(const dataItem in incomingData) {
                let sendUpdate = true;
                if(!this.dataValueCache[dataItem]) {
                    sendUpdate = true;
                } else {
                    if(this.dataValueCache[dataItem] !== incomingData[dataItem]) {
                        sendUpdate = true;
                    }
                }
                if(sendUpdate) {
                    this.dataValueCache[dataItem] = incomingData[dataItem];
                    updateData[dataItem] = this.dataValueCache[dataItem];
                }
                if(Object.keys(updateData).length > 0) {
                    this.server.sendSocketMessage('plantUpdate', updateData);
                }
            }            
            if (this.db) {
                this.db.plants.insert(updateData);
            }
            this.server.sendSocketMessage('plantUpdate', updateData);
        } catch (err) {
            console.info(err);
        }

    }

    stop() {
        if (this.showDebug) {
            console.info(`[PlantMonService] stop`);
        }
        super.stop();
    }

    update() {
        if (this.showDebug) {
            console.info(`[PlantMonService] update`);
        }
        super.update();
    }

}

module.exports = PlantMonService;
