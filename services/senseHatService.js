const BaseService = require('./baseService');
const sense = require("sense-hat-led");
const util = require('util') 
const nodeimu  = require('nodeimu'); 
const IMU = new nodeimu.IMU(); 
const senseJoystick = require('sense-joystick');

class SenseHatService extends BaseService {


    constructor(serviceConfig, db, httpServer, showDebug = false) {
        super(serviceConfig, db, httpServer, showDebug);

        this.pixelRowIndex = 2;
        this.pixelColumnIndex = 0;
        this.red = [200, 0, 0];
        this.redDark = [50, 0, 0];
        this.green = [0,200,0];
        this.greenDark = [0,50,0];
        this.blue = [0,0,172];
        this.blueDark = [0,0,50];
        this.black = [0, 0, 0];
        this.white = [255,255,255];
        this.scanRight = true;
        this.lastColumnScanned = 0;
        this.joystickState = 'none';
        this.joystick = null;
        this.dataValueCache = {};
        this.joystickMap = {
            none: 0,
            left: 1,
            right: 2,
            up: 3,
            down: 4,
            click: 5
        }
        this.logoColIndex = 0;
        this.swimLogo = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,0,0,0,0,0,0],
            [0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0],
            [0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0],
            [0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0],
            [0,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        ]
        this.swimLogoLarge = [
            [0,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
            [0,1,1,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
            [0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
        ]
        this.activeLogo = this.swimLogoLarge;
            
    }

    start() {
        super.start();
        if (this.showDebug) {
            console.info(`[SenseHatService] start`);
        }

        if(this.activeLogo === null) {
            sense.clear();
            for(let i = 0; i<=7; i=i+1) {
                sense.setPixel(i, 0, this.black);
                sense.setPixel(i, 1, this.blueDark);
                sense.setPixel(i, 2, this.blue);
                sense.setPixel(i, 5, this.blue);
                sense.setPixel(i, 6, this.blueDark);
                sense.setPixel(i, 7, this.black);
            }
        } else {
            sense.clear();
            for(let y = 0; y <= 7; y=y+1) {
                for(let x = 0; x <=7; x=x+1) {
                    sense.setPixel(x, y, (this.activeLogo[y][x+this.logoColIndex] === 0 ? this.blue : this.white));
                }
            }
        }
        

        senseJoystick.getJoystick()
        .then((joystick) => {

            joystick.on('press', (direction) => {
                this.joystickState = direction;
            });
            joystick.on('hold', (direction) => {
                this.joystickState = direction;
            });
            joystick.on('release', (direction) => {
                this.joystickState = 'none';
            });
        });
    }

    stop() {
        if (this.showDebug) {
            console.info(`[SenseHatService] stop`);
        }
        super.stop();
    }

    mapRange(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    update() {
        if(this.scanRight) {
            this.pixelColumnIndex = this.pixelColumnIndex + 1;
            if(this.pixelColumnIndex > 7) {
                this.pixelColumnIndex = 6;
                this.scanRight = false;
            }
        } else {
            this.pixelColumnIndex = this.pixelColumnIndex - 1;
            if(this.pixelColumnIndex < 0) {
                this.pixelColumnIndex = 1;
                this.scanRight = true;
            }

        }

        if(this.activeLogo === null) {
            sense.clear();
            for(let i = 0; i<=7; i=i+1) {
                sense.setPixel(i, 0, this.black);
                sense.setPixel(i, 1, this.blueDark);
                sense.setPixel(i, 2, this.blue);
                sense.setPixel(i, 3, this.black);
                sense.setPixel(i, 4, this.black);
                sense.setPixel(i, 5, this.blue);
                sense.setPixel(i, 6, this.blueDark);
                sense.setPixel(i, 7, this.black);
            }        
            sense.setPixel(this.lastColumnScanned, this.pixelRowIndex+1, (this.joystickState === 'none') ? this.greenDark : this.redDark);
            sense.setPixel(this.lastColumnScanned, this.pixelRowIndex+2, (this.joystickState === 'none') ? this.greenDark : this.redDark);
            sense.setPixel(this.pixelColumnIndex, this.pixelRowIndex+1, (this.joystickState === 'none') ? this.green : this.red);
            sense.setPixel(this.pixelColumnIndex, this.pixelRowIndex+2, (this.joystickState === 'none') ? this.green : this.red);

            this.lastColumnScanned = this.pixelColumnIndex;
        } else {

            this.logoColIndex = this.logoColIndex + 1;
            for(let y = 0; y <= 7; y=y+1) {
                for(let x = 0; x <=7; x=x+1) {
                    let newX = x + this.logoColIndex;
                    if(newX >= this.activeLogo[y].length) {
                        newX = newX - this.activeLogo[y].length
                    }
                    sense.setPixel(x, y, (this.activeLogo[y][newX] === 0 ? this.blue : this.white));
                }
            }
            if(this.logoColIndex >= this.activeLogo[0].length) {
                this.logoColIndex = 0;
            }
        }

        
        var tic = new Date(); 
        var data = IMU.getValueSync();
        var toc = new Date();

        const updateData = {};
        const incomingData = {
            temperature: Math.round(data.temperature), // Math.round(((9.0 / 5.0) * data.temperature + 32.0)) <-- F
            pressure: Math.round(data.pressure.toFixed(1)),
            humidity: Math.round(data.humidity.toFixed(1)),
            accelerationX: Math.round(this.mapRange(data.gyro.x.toFixed(2), -1, 1, 0, 100)),
            accelerationY: Math.round(this.mapRange(data.gyro.y.toFixed(2), -1, 1, 0, 100)),
            accelerationZ: Math.round(this.mapRange(data.gyro.z.toFixed(2), -1, 1, 0, 100)),
            gyroX: Math.round(this.mapRange(data.accel.x.toFixed(3), -1, 1, 0, 100)),
            gyroY: Math.round(this.mapRange(data.accel.y.toFixed(3), -1, 1, 0, 100)),
            gyroZ: Math.round(this.mapRange(data.accel.z.toFixed(3), -1, 1, 0, 100)),
            compassX: Math.round(data.compass.x.toFixed(2)),
            compassY: Math.round(data.compass.y.toFixed(2)),
            compassZ: Math.round(data.compass.z.toFixed(2)),
            // fusionPoseX: data.fusionPose.x.toFixed(2),
            // fusionPoseY: data.fusionPose.y.toFixed(2),
            // fusionPoseZ: data.fusionPose.z.toFixed(2),
            joystickState: this.joystickMap[this.joystickState] || 0
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


        if (this.showDebug) {
            console.info(`[PlantMonService] update`);
        }
        super.update();
    }

}

module.exports = SenseHatService;
