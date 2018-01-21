const TwitterBot = require('./twitterBot');
const WikiQuote = require('../modules/wikiQuote');
const mongojs = require('mongojs');

class QuoteBot extends TwitterBot {

    constructor(botConfig, db, showDebug = false) {
        super(botConfig, db, showDebug);

        this.wikiQuote = new WikiQuote(this.config.wikiApiUrl, this.config.authorList, this.showDebug);

        if (this.showDebug) {
            console.info(`[QuoteBot] constructor`);
        }
    }

    randomTweet() {
        if (this.showDebug) {
            console.info(`[QuoteBot] randomTweet`);
        }

        if (this.config.useDb && this.config.useDb === true) {
            this.db.quotes.find({
                canUse: true
            }).toArray((err, docs) => {
                if (docs) {
                    const recordCount = docs.length;
                    if (recordCount > 0) {
                        const spaceRegex = new RegExp("[ ]+", "g");
                        const dotRegex = new RegExp("[.]+", "g");
                        const randomIndex = Math.floor(Math.random() * Math.floor(recordCount));
                        const quoteData = docs[randomIndex];
                        const quote = quoteData.content;
                        const title = quoteData.author;
                        const signature = `\n#${title.replace(spaceRegex,'').replace(dotRegex,'')}`;
                        const finalQuote = `${quote}${signature}`;

                        if (this.showDebug) {
                            console.info(`[QuoteBot] use : ${finalQuote}`);
                        }

                        this.tweet(finalQuote);

                        this.db.quotes.findAndModify({
                            query: {
                                '_id': mongojs.ObjectId(quoteData['_id'])
                            },
                            update: {
                                author: quoteData['author'],
                                content: quoteData['content'],
                                canUse: false,
                                lastUsed: new Date(),
                            },
                            new: true
                        }, (err, doc, lastErr) => {
                            // console.info(err, doc, lastErr);
                            if (err) {
                                console.error('[QuoteBot]', err);
                            }
                        })
                    }
                }
                if (err) {
                    console.error('[QuoteBot] Error getting quotes from db.');
                }

            })
        }


        if (this.config.useWikiQuote && this.config.useWikiQuote === true) {
            this.wikiQuote.getRandomQuote()
                .then((result) => {
                    if (result) {
                        console.info(`[QuoteBot] use : ${result}`);
                        this.tweet(result);
                    }
                })
        }

    }

}

module.exports = QuoteBot;