const TwitterBot = require('./twitterBot');
const WikiQuote = require('../modules/wikiQuote');

class QuoteBot extends TwitterBot {

    constructor(botConfig, showDebug = false) {
        super(botConfig, showDebug);

        this.wikiQuote = new WikiQuote(this.config.wikiApiUrl, this.config.authorList, this.showDebug);
        if (this.showDebug) {
            console.info(`[QuoteBot] constructor`);
        }
    }

    randomTweet() {
        if (this.showDebug) {
            console.info(`[QuoteBot] randomTweet`);
        }

        this.wikiQuote.getRandomQuote()
            .then((result) => {
                if (result) {
                    console.info(`[QuoteBot] use : ${result}`);
                    this.tweet(result);
                }
            })

    }

}

module.exports = QuoteBot;