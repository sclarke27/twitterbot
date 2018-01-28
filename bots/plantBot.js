const TwitterBot = require('./twitterBot');

class PlantBot extends TwitterBot {

    constructor(botConfig, db, showDebug = false) {
        super(botConfig, db, showDebug);
        this.lastUpdateTimestamp = null;
        this.lastMoistureValue = null;
        this.lastLightValue = null;
        if (this.showDebug) {
            console.info(`[PlantBot] constructor`);
        }
    }

    randomTweet() {
        if (this.showDebug) {
            console.info(`[PlantBot] randomTweet`);
        }
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

module.exports = PlantBot;