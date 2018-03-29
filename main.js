console.info('[main] Loading libraries ...');

const httpConfig = require('./httpServer/config/httpConfig');
const dbConfig = require('./httpServer/config/dbConfig');
const plantBotConfig = require('./config/plantBotConfig');
const plantServiceConfig = require('./config/plantServiceConfig');

// servers
const httpServer = require('./httpServer/server');
const mongojs = require('mongojs');

// services
const PlantMonService = require('./services/plantMonService');

// bot classes
const TwitterBot = require('./bots/twitterBot');
const PlantBot = require('./bots/plantBot');
const swim = require('swim-client-js');
// const swimClient = swim.Client();


console.info('[main] Libraries loaded');

class Main {
    constructor(showDebug = true) {
        this.showDebug = showDebug;
        this.botList = [];
        this.servicesList = [];
        this.db = null;
        this.httpServer = null;
        this.swimHost = null;

        if (this.showDebug) {
            if (this.showDebug) {
                console.info('[main] constructed');
            }
        }
    }

    initialize(botList, servicesList) {

        // start db connection if enabled
        if (dbConfig.enabled) {
            if (this.showDebug) {
                console.info(`[main] connect to db ${dbConfig.dbName}`);
            }
            this.db = mongojs(dbConfig.dbName, dbConfig.collections);
            this.db.on('connect', () => {
                console.info('[main] database connected')
            })
            this.db.on('error', (err) => {
                console.error('[main] database error', err)
            })
        }

        // start http server
        if (httpConfig.enabled) {
            this._httpServer = new httpServer(httpConfig, this.db, this.showDebug);
            this._httpServer.startHttpServer(this);
        }

        if (servicesList) {
            for (const service of servicesList) {
                const serviceClass = service[0];
                const serviceConfig = service[1];
                this.servicesList.push(new serviceClass(serviceConfig, this.db, this._httpServer, this.showDebug));
            }
        }

        // create the bots and push to this.botList
        for (const startingBot of botList) {
            const botClass = startingBot[0];
            const botConfig = startingBot[1];
            this.botList.push(new botClass(botConfig, this.db, this.showDebug));
            if (dbConfig.enabled) {
                this.db.bots.findAndModify({
                    query: {
                        name: botConfig.botName
                    },
                    update: {
                        name: botConfig.botName,
                        startupTimestamp: new Date(),
                        isEnabled: botConfig.enabled ? true : false,
                        isTweeting: (botConfig.randomTweet && botConfig.randomTweet.enabled) ? true : false,
                        isRetweeting: (botConfig.randomRetweet && botConfig.randomRetweet.enabled) ? true : false,
                        isFavoriting: (botConfig.randomFavorite && botConfig.randomFavorite.enabled) ? true : false,
                        isTrackingFollowers: (botConfig.trackFollowers && botConfig.trackFollowers.enabled) ? true : false,
                        tweetInterval: (botConfig.randomTweet && botConfig.randomTweet.enabled) ? botConfig.randomTweet.intervalTimeout : 0,
                        retweetInterval: (botConfig.randomRetweet && botConfig.randomRetweet.enabled) ? botConfig.randomRetweet.intervalTimeout : 0,
                        favoriteInterval: (botConfig.randomFavorite && botConfig.randomFavorite.enabled) ? botConfig.randomFavorite.intervalTimeout : 0,
                        followerTrackingInterval: (botConfig.trackFollowers && botConfig.trackFollowers.enabled) ? botConfig.trackFollowers.intervalTimeout : 0,
                    },
                    new: true,
                    upsert: true
                }, (err, doc, lastErr) => {
                    // console.info(err, doc, lastErr);
                    if (err) {
                        console.error('[main]', err);
                    }
                })
            }
        }

        // connect to swim services
        // if (swimClient) {
        //     swimHost = swimClient.host()
        // }

        if (this.showDebug) {
            console.info(`[main] initialize and started ${this.botList.length} bots`);
        }

    }

    findService(botName) {
        for (const service of this.servicesList) {
            if (service.config.botName === botName) {
                return service
            }
        }
        return null;
    }

    findBot(botName) {
        for (const bot of this.botList) {
            if (bot.config.botName === botName) {
                return bot
            }
        }
        return null;
    }

    startBot(botName) {
        const bot = this.findBot(botName);
        const service = this.findService(botName);
        this.toggleBot(bot, service, true);
    }

    stopBot(botName) {
        const bot = this.findBot(botName);
        const service = this.findService(botName);
        this.toggleBot(bot, service, false);
    }

    toggleBot(bot, service, isEnabled) {
        if (bot) {
            bot.config.enabled = isEnabled;
            if (isEnabled) {
                bot.start();
            } else {
                bot.end();
            }
        }
        if (service) {
            service.config.enabled = isEnabled;
            if (isEnabled) {
                service.start();
            } else {
                service.stop();
            }
        }
    }

    start() {
        if (this.showDebug) {
            console.info('[main] start');
        }
        for (const service of this.servicesList) {
            // console.info(bot);
            service.start();
        }
        for (const bot of this.botList) {
            // console.info(bot);
            bot.start();
        }

    }

    end() {
        if (this.showDebug) {
            console.info('[main] end');
        }
        for (const bot of this.botList) {
            bot.end();
        }

    }
}

const showDebug = true;
const main = new Main(true);

const botList = [
    [PlantBot, plantBotConfig]
]

const servicesList = [
    [PlantMonService, plantServiceConfig]
];
console.info('[main] Start');
main.initialize(botList, servicesList);
main.start();