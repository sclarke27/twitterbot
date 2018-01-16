const CatBotConfig = require('./config/catConfig');
const CatBot = require('./bots/catBot');
const DogBotConfig = require('./config/dogConfig');
const DogBot = require('./bots/dogBot');
const QuoteBotConfig = require('./config/quoteConfig');
const QuoteBot = require('./bots/quoteBot');
const Sclarke27Config = require('./config/sclarke27Config');
const TwitterBot = require('./bots/twitterBot');
const httpConfig = require('./httpServer/config/httpConfig');
const httpServer = require('./httpServer/server');
const mongojs = require('mongojs');
const dbConfig = require('./httpServer/config/dbConfig');

class Main {
    constructor(showDebug = true) {
        this.showDebug = showDebug;
        this.wikiQuote = null;
        this.botList = [];
        this.db = null;
        this.httpServer = null;

        if (this.showDebug) {
            if (this.showDebug) {
                console.info('[main] constructed');
            }
        }
    }

    initialize(botList) {

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

        if (httpConfig.enabled) {
            this._httpServer = new httpServer(httpConfig, this.db, this.showDebug);
            this._httpServer.startHttpServer();
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

        if (this.showDebug) {
            console.info(`[main] initialize and started ${this.botList.length} bots`);
        }

    }

    start() {
        if (this.showDebug) {
            console.info('[main] start');
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
    [CatBot, CatBotConfig],
    [TwitterBot, DogBotConfig],
    [QuoteBot, QuoteBotConfig],
    [TwitterBot, Sclarke27Config]
]

main.initialize(botList);
main.start();