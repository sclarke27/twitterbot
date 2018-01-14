const CatBotConfig = require('./config/catConfig');
const CatBot = require('./bots/catBot');
const DogBotConfig = require('./config/dogConfig');
const DogBot = require('./bots/dogBot');
const QuoteBotConfig = require('./config/quoteConfig');
const QuoteBot = require('./bots/quoteBot');

class Main {
    constructor(showDebug = true) {
        this.showDebug = showDebug;
        this.wikiQuote = null;
        this.botList = [];

        if (this.showDebug) {
            console.info('[main] constructed');
        }
    }

    initialize(botList) {

        // create the bots and push to this.botList
        for (const startingBot of botList) {
            const botClass = startingBot[0];
            const botConfig = startingBot[1];
            this.botList.push(new botClass(botConfig, this.showDebug));
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
            // console.info(bot);
            bot.end();
        }

    }
}

const showDebug = true;
const main = new Main(true);

const botList = [
    [CatBot, CatBotConfig],
    [DogBot, DogBotConfig],
    [QuoteBot, QuoteBotConfig]
]

main.initialize(botList);
main.start();