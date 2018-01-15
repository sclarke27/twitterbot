const CatBotConfig = require('./config/catConfig');
const CatBot = require('./bots/catBot');
const DogBotConfig = require('./config/dogConfig');
const DogBot = require('./bots/dogBot');
const QuoteBotConfig = require('./config/quoteConfig');
const QuoteBot = require('./bots/quoteBot');
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

            for (const collectionName of dbConfig.collections) {
                console.info(this.db[collectionName])
                if (!this.db[collectionName]) {
                    this.db.createCollection(collectionName, {});
                    if (this.showDebug) {
                        console.info(`[main] collection created ${dbConfig.dbName}:${collectionName}`);
                    }
                }

            }

        }

        if (httpConfig.enabled) {
            this._httpServer = new httpServer(httpConfig, this.db, this.showDebug);
            this._httpServer.startHttpServer();
        }

        // create the bots and push to this.botList
        for (const startingBot of botList) {
            const botName = startingBot[0];
            const botClass = startingBot[1];
            const botConfig = startingBot[2];
            botConfig.botName = botName;
            this.botList.push(new botClass(botConfig, this.db, this.showDebug));
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
    ['CatBot', CatBot, CatBotConfig],
    ['DogBot', TwitterBot, DogBotConfig],
    ['QuoteBot', QuoteBot, QuoteBotConfig]
]

main.initialize(botList);
main.start();