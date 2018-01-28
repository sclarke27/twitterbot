const express = require('express');
const http = require('http').Server(express);
const path = require('path');
const expressHandlebars = require('express-handlebars');
const mongojs = require('mongojs');
const dbConfig = require('./config/dbConfig');
const startingQuoteDb = require('./config/startingQuoteDb');
const WikiQuote = require('../modules/wikiQuote');

// expressHandlebars.prototype.handlebars.registerHelper('if_eq', function (a, b, opts) {
//     if (a == b) {
//         return opts.fn(this);
//     } else {
//         return opts.inverse(this);
//     }
// });

class HttpServer {
    constructor(httpConfig, db, showDebug = false) {
        this.config = httpConfig;
        this.port = this.config.port;
        this.server = null;
        this.webApp = null;
        this.io = null;
        this.db = db;
        this.showDebug = showDebug;
        this.hbsHelpers = null;
        this.wikiQuote = null;

        this.botList = [];
    }

    /**
     * start up http server and setup express
     */
    setUpEngine() {

        this.wikiQuote = new WikiQuote(this.config.wikiApiUrl, this.config.authorList, this.showDebug);

        this.webApp = express();
        this.webApp.engine('.hbs', expressHandlebars({
            defaultLayout: 'main',
            extname: '.hbs',
            layoutsDir: path.join(__dirname, 'views/layouts')
        }));
        this.webApp.set('view engine', '.hbs');
        this.webApp.set('views', path.join(__dirname, 'views'));
        this.webApp.use('/js', express.static(path.join(__dirname + '/views/js')));
        this.webApp.use('/css', express.static(path.join(__dirname + '/views/css')));
        this.webApp.use('/assets', express.static(path.join(__dirname + '/views/assets')));

        this.server = require('http').Server(this.webApp);

        this.io = require('socket.io')(this.server);

        this.io.on('connection', (client) => {
            if (this.showDebug) {
                console.info('[httpServer] user socket connected');
            }

            // client.on('phoneMag', (data) => {
            //     // console.log(data);
            //     if (this._sensors) {
            //         this._sensors.setDataValue('phoneMagX', data.x);
            //         this._sensors.setDataValue('phoneMagY', data.y);
            //         this._sensors.setDataValue('phoneMagZ', data.z);
            //     }
            // });

            client.on('disconnect', () => {
                if (this.showDebug) {
                    console.info('[httpServer] user socket disconnected');
                }
            });
        })

        this.hbsHelpers = {
            'if_eq': (a, b, opts) => {
                if (a == b) {
                    return opts.fn(this);
                } else {
                    return opts.inverse(this);
                }
            },
            'if_not_eq': (a, b, opts) => {
                if (a != b) {
                    return opts.fn(this);
                } else {
                    return opts.inverse(this);
                }
            },
        };

        this.db.bots.find().sort({
            botName: -1
        }).toArray((err, docs) => {
            this.botList = docs;
        });


    }

    /**
     * 
     */
    sendSocketMessage(messageKey, messageData) {
        this.io.emit(messageKey, messageData);
    }

    /**
     * server error handler
     * @param  {[Object]} err [message object]
     */
    onServerStarted(err) {
        if (err) {
            console.error('[httpServer] startup error', err);
        }
        if (this.showDebug) {
            console.info(`[httpServer] express server listening on ${this.port}`);
        }

    }

    /**
     * route to handle main page user sees in browser
     */
    createHomeRoute() {
        this.webApp.get('/', (request, response) => {
            this.db.bots.find().sort({
                botName: -1
            }).toArray((err, docs) => {
                response.render('homePage', {
                    routeName: 'home',
                    botList: docs,
                    helpers: this.hbsHelpers
                })
            })
        })

    }

    /**
     * Route to handle list of tweets
     */
    createListBotRoute() {
        this.webApp.get('/bot/:botName', (request, response) => {
            const reqParams = request.params;
            const selectedBotName = reqParams.botName;
            this.db.bots.find().sort({
                botName: -1
            }).toArray((err, docs) => {

                response.render('botPage', {
                    routeName: 'bot',
                    botName: selectedBotName,
                    botList: docs,
                    helpers: this.hbsHelpers
                })

            });
        })
        this.webApp.route('/listBots')
            .post((request, response) => {
                this.db.bots.find().sort({
                    botName: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })
    }

    /**
     * Route to handle list of tweets
     */
    createListFollowersRoute() {
        this.webApp.route('/followers')
            .post((request, response) => {
                this.db.retweets.find().sort({
                    followerCount: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })

        this.webApp.route('/followers/:botName')
            .post((request, response) => {
                const reqParams = request.params;
                const selectedBotName = reqParams.botName;

                this.db.followers.find({
                    botName: selectedBotName
                }).sort({
                    followerCount: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })

    }

    /**
     * Route to handle list of tweets
     */
    createListTweetRoute() {
        this.webApp.route('/listTweets/:botName')
            .post((request, response) => {
                const reqParams = request.params;
                const selectedBotName = reqParams.botName;

                this.db.tweets.find({
                    botName: selectedBotName
                }).sort({
                    timestamp: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })
        this.webApp.route('/listTweets')
            .post((request, response) => {
                this.db.tweets.find().sort({
                    timestamp: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })
    }

    /**
     * Route to handle list of tweets
     */
    createListRetweetRoute() {
        this.webApp.route('/listRetweets/:botName')
            .post((request, response) => {
                const reqParams = request.params;
                const selectedBotName = reqParams.botName;

                this.db.retweets.find({
                    botName: selectedBotName
                }).sort({
                    timestamp: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })

        this.webApp.route('/listRetweets')
            .post((request, response) => {
                this.db.retweets.find().sort({
                    timestamp: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })
    }

    /**
     * Route to handle list of tweets
     */
    createListFavoritesRoute() {

        this.webApp.route('/listFavorites/:botName')
            .post((request, response) => {
                const reqParams = request.params;
                const selectedBotName = reqParams.botName;

                this.db.favorites.find({
                    botName: selectedBotName
                }).sort({
                    timestamp: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })
        this.webApp.route('/listFavorites')
            .post((request, response) => {
                this.db.favorites.find().sort({
                    timestamp: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })
    }

    /**
     * Route to handle list of tweets
     */
    createPlantsRoute() {

        this.webApp.route('/plants/history/:plantId')
            .post((request, response) => {
                const reqParams = request.params;
                const plantId = reqParams.plantId;

                this.db.plants.find({
                    plantId: plantId
                }).limit(5000).sort({
                    timestamp: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                });
            })
        this.webApp.route('/plants/:plantId')
            .get((request, response) => {
                const reqParams = request.params;
                const plantId = reqParams.plantId;

                // this.db.plants.find({
                //     plantId: plantId
                // }).sort({
                //     timestamp: -1
                // }).toArray((err, docs) => {
                response.render('plantsPage', {
                    routeName: 'plant',
                    plantId: plantId,
                    // plantHistory: docs,
                    botList: this.botList,
                    helpers: this.hbsHelpers
                })
                // })
            })
    }

    createQuotesRoute() {
        this.webApp.route('/quotes')
            .get((request, response) => {
                this.db.bots.find().sort({
                    _id: -1
                }).toArray((err, docs) => {

                    response.render('quotesPage', {
                        routeName: 'quotesList',
                        botList: docs,
                        helpers: this.hbsHelpers
                    })
                })
            })
            .post((request, response) => {
                this.db.quotes.find().sort({
                    author: 1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                })
            })

        this.webApp.route('/quotes/used')
            .post((request, response) => {
                this.db.quotes.find({
                    canUse: false
                }).sort({
                    lastUsed: -1
                }).toArray((err, docs) => {
                    response.json({
                        data: docs,
                        dbErrors: err
                    })
                })
            })

        this.webApp.route('/quote/:quoteId')
            .post((request, response) => {
                const reqParams = request.params;
                const quoteId = reqParams.quoteId;
                this.db.quotes.find({
                    '_id': mongojs.ObjectId(quoteId)
                }).toArray((err, docs) => {
                    response.json({
                        quoteData: docs,
                        error: err
                    })
                })
            })

        this.webApp.route('/quote/delete/:quoteId')
            .post((request, response) => {
                const reqParams = request.params;
                const reqQuery = request.query;
                const quoteId = reqParams.quoteId;
                this.db.quotes.remove({
                    '_id': mongojs.ObjectId(quoteId)
                }, (err, doc, lastErr) => {
                    if (err) {
                        console.error('[main]', err);
                    }
                })
            })

        this.webApp.route('/quote/update/:quoteId')
            .post((request, response) => {
                const reqParams = request.params;
                const reqQuery = request.query;
                const quoteId = reqParams.quoteId;
                console.info(quoteId, reqQuery);
                if (quoteId == 0) {
                    const newDataObj = {
                        author: (reqQuery.author == "") ? "Anonymous" : reqQuery.author,
                        content: reqQuery.content,
                        canUse: (reqQuery.canUse) ? true : false,
                        lastUsed: null
                    }
                    this.db.quotes.insert(newDataObj);
                } else {
                    this.db.quotes.findAndModify({
                        query: {
                            '_id': mongojs.ObjectId(quoteId)
                        },
                        update: {
                            author: reqQuery.author,
                            content: reqQuery.content,
                            canUse: Boolean(reqQuery.canUse === "true")
                        },
                        new: true
                    }, (err, doc, lastErr) => {
                        if (err) {
                            console.error('[main]', err);
                        }
                    })
                }
            })


        this.webApp.route('/quotes/reset')
            .get((request, response) => {
                if (this.db.quotes) {
                    this.db.quotes.drop();
                }
                for (const quoteIndex in startingQuoteDb) {
                    const quote = startingQuoteDb[quoteIndex];
                    const newDataObj = {
                        author: (quote.quoteAuthor == "") ? "Anonymous" : quote.quoteAuthor,
                        content: quote.quoteText,
                        canUse: true,
                        lastUsed: null
                    }
                    this.db.quotes.insert(newDataObj);
                }
                response.json({
                    data: startingQuoteDb
                })

            })

        this.webApp.route('/quotes/randomWikiQuote')
            .post((request, response) => {
                this.wikiQuote.getRandomQuote()
                    .then((result) => {
                        if (result) {
                            console.info(`[QuoteBot] use : ${result}`);
                            response.json({
                                data: result
                            })

                        } else {
                            response.json({
                                data: null
                            })
                        }

                    })
            })
    }

    /**
     * startup http server
     */
    startHttpServer() {
        this.setUpEngine();
        this.createListTweetRoute();
        this.createListRetweetRoute();
        this.createListFavoritesRoute();
        this.createListFollowersRoute();
        this.createListBotRoute();
        this.createQuotesRoute();
        this.createPlantsRoute();
        this.createHomeRoute();

        this.server.listen(this.port, this.onServerStarted.bind(this));

    }


}

module.exports = HttpServer;