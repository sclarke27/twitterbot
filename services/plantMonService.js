const BaseService = require('./baseService');
const ArduinoBoard = require('../modules/ArduinoBoard');

class PlantMonService extends BaseService {
    constructor(serviceConfig, db, httpServer, showDebug = false) {
        super(serviceConfig, db, httpServer, showDebug);
        this.arduino = new ArduinoBoard(false);
    }

    start() {
        // super.start();
        if (this.showDebug) {
            console.info(`[PlantMonService] start baud${this.config.baud}`);
        }
        this.arduino.setDataHandler(this.onSerialData.bind(this));
        this.arduino.startPort(this.config.baud);
    }

    onSerialData(newData) {
        // console.info(newData);
        try {
            const sensorData = JSON.parse(newData);
            // console.info('[PlantMonService]', sensorData.temperature, sensorData.tmp36, ((sensorData.temperature + sensorData.tmp36) / 2));
            const updateData = {
                plantId: 'plant1',
                moisture: sensorData.moisture,
                light: sensorData.light,
                pressure: sensorData.pressure,
                temperature0: sensorData.temperature,
                temperature1: sensorData.tmp36ch1,
                temperature2: sensorData.tmp36ch2,
                timestamp: new Date()
            };
            // this.db.plants.insert(updateData);
            this.server.sendSocketMessage('plantUpdate', updateData);
        } catch (err) {
            // console.info(err, newData);
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