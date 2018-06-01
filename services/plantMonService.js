const BaseService = require('./baseService');
const ArduinoBoard = require('../modules/ArduinoBoard');
const swim = require('swim-client-js');

class PlantMonService extends BaseService {

    constructor(serviceConfig, db, httpServer, showDebug = false) {
        super(serviceConfig, db, httpServer, showDebug);
        this.arduino = new ArduinoBoard(false);

        this.dataValueCache = {};

        this.pollingUpdateEnabled = true;
        this.pollingIntervalMS = 200;
        this.pollingInterval = null;
            
        this.alertsService = null;
    }

    start() {
        // super.start();
        if (this.showDebug) {
            console.info(`[PlantMonService] start baud${this.config.baud}`);
        }
        this.arduino.setDataHandler(this.onSerialData.bind(this));
        this.arduino.startPort(this.config.baud);

        if(this.pollingUpdateEnabled) {
            this.pollingInterval = setInterval(() => {
                this.updateSwim();
            }, this.pollingIntervalMS);
        }

        this.alertsService = swim.downlinkValue().host('ws://127.0.0.1:5620').node('/sensor/light').lane('latest');
        this.alertsService.onEvent((message, downlink) => {
            console.info(message, downlink);
        })
    }

    updateSwim() {
        // console.info(this.dataValueCache);
        if(Object.keys(this.dataValueCache).length > 0) {
            this.server.sendSocketMessage('plantUpdate', this.dataValueCache);
        }
    }


    onSerialData(newData) {
        try {
            const sensorData = JSON.parse(newData);
            if (this.showDebug) {
                console.info('[PlantMonService]', sensorData.soil, sensorData.light, sensorData.temp);
            }
            const updateData = {};

            for(const dataItem in sensorData) {
                let sendUpdate = false;
                if(!this.dataValueCache[dataItem] && this.dataValueCache[dataItem] !== 0) {
                    sendUpdate = true;
                } else {
                    if(this.dataValueCache[dataItem] !== sensorData[dataItem]) {
                        sendUpdate = true;
                    }
                }
                if(sendUpdate) {
                    this.dataValueCache[dataItem] = sensorData[dataItem];
                    updateData[dataItem] = this.dataValueCache[dataItem];
                }
            }            
            if(!this.pollingUpdateEnabled) {
                // console.info(updateData);
                if(Object.keys(updateData).length > 0) {
                	this.server.sendSocketMessage('plantUpdate', updateData);
                }
            }
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
