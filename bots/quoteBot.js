const TwitterBot = require('./twitterBot');
const WikiQuote = require('../modules/wikiQuote');

class QuoteBot extends TwitterBot {

    constructor(botConfig, db, showDebug = false) {
        super(botConfig, db, showDebug);

        this.wikiQuote = new WikiQuote(this.config.wikiApiUrl, this.config.authorList, this.showDebug);

        this.quoteDbCollection = null;

        if (this.showDebug) {
            console.info(`[QuoteBot] constructor`);
        }
    }

    randomTweet() {
        if (this.showDebug) {
            console.info(`[QuoteBot] randomTweet`);
        }
        this.quoteDbCollection = this.db.collection('quotes');

        console.info('[QuoteBot]', this.quoteDbCollection);

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