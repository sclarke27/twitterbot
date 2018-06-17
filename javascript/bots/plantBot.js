const BaseBot = require('./baseBot');
const swim = require('swim-client-js');

class PlantBot extends BaseBot {

    constructor(botConfig, showDebug = false, arduino) {
        super(botConfig, showDebug);
        this.lastUpdateTimestamp = null;
        this.lastMoistureValue = null;
        this.lastLightValue = null;
        this.lightThresholdValue = -1;
        this.isLightOn = false;
        this.arduino = arduino;
        this.swimClient = new swim.Client();
        this.updateInterval = null;

        this.lightSensorValueLane = this.swimClient.downlinkValue()
            .host(`ws://127.0.0.1:5620`)
            .node('/sensor/light')
            .lane('latest')
            .didSet((newValue) => {
                this.lastLightValue = newValue
            });

        this.lightThresholdValueLane = this.swimClient.downlinkValue()
            .host(`ws://127.0.0.1:5620`)
            .node('/sensor/light')
            .lane('threshold')
            .didSet((newValue) => {
                this.lightThresholdValue = newValue
            });

        if (this.showDebug) {
            console.info(`[PlantBot] constructed`);
        }
    }

    start() {
        super.start();
        if (this.showDebug) {
            console.info(`[PlantBot] start ${this.config.updateInterval.intervalTimeout}`);
        }
        this.lightSensorValueLane.open();
        this.lightThresholdValueLane.open();
        if(this.config.updateInterval.enabled) {
            this.updateInterval = setInterval( this.update.bind(this), this.config.updateInterval.intervalTimeout);
        }
    }

    update() {
        if (this.showDebug) {
            console.info(`[PlantBot] update`);
            console.info(`light ${this.lastLightValue} <= ${this.lightThresholdValue}`);
        }
        if(this.lastLightValue <= this.lightThresholdValue) {
            if(!this.isLightOn) {
                if (this.showDebug) {
                    console.info('turn on light');
                }
                this.arduino.writeMessage('lightOn');
                this.isLightOn = true;
            }
        } else {
            if(this.isLightOn) {
                if (this.showDebug) {
                    console.info('turn off light');
                }
                this.arduino.writeMessage('lightOff');
                this.isLightOn = false;
            }
        }
    }

    randomTweet() {
        if (this.showDebug) {
            console.info(`[PlantBot] randomTweet`);
        }
        if (this.db) {
            this.db.plants.find().sort({
                timestamp: -1
            }).limit(1).toArray((err, docs) => {
                if (this.lastMoistureValue === null || this.lastUpdateTimestamp !== docs[0].timestamp) {
                    let tweetMessage = '';
                    if (this.lastMoistureValue === null) {
                        tweetMessage = `Start tracking\nMoisture at [${docs[0].moisture}]\nLight at [${docs[0].light}]`;
                    } else if ((this.lastMoistureValue - docs[0].moisture >= 10)) {
                        tweetMessage = `Moisture level down by ten points or more [${docs[0].moisture}] `;
                        if (this.lastMoistureValue <= 600) {
                            if (this.lastMoistureValue <= 500) {
                                tweetMessage = `${tweetMessage}\nMy soil is getting dry.`
                            } else {
                                tweetMessage = `${tweetMessage}\nI need water soon!`
                            }
                        }
                    } else if ((this.lastMoistureValue - docs[0].moisture <= -10)) {
                        tweetMessage = `Moisture level up by ten points or more [${docs[0].moisture}].\nHope that is just water. `;
                    }
                    if (this.lastLightValue - docs[0].light >= 10) {
                        if (tweetMessage == '') {
                            tweetMessage = `My soil moisture has not changed [${docs[0].moisture}]`
                        }
                        tweetMessage = `${tweetMessage}\nIt seems to be getting darker [${docs[0].light}]`;
                    } else if (this.lastLightValue - docs[0].light <= -10) {
                        if (tweetMessage == '') {
                            tweetMessage = `My soil moisture has not changed [${docs[0].moisture}]`
                        }
                        tweetMessage = `${tweetMessage}\nIt seems to be getting brighter [${docs[0].light}]`;
                    }
                    if (tweetMessage !== '') {
                        this.lastUpdateTimestamp = docs[0].timestamp;
                        this.lastMoistureValue = docs[0].moisture;
                        this.lastLightValue = docs[0].light;
                        console.info(tweetMessage);
                        this.tweet(tweetMessage);
                    }
                }
            })
        }

    }

}

module.exports = PlantBot;