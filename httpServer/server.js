const express = require('express');
const http = require('http').Server(express);
const path = require('path');
const handlebars = require('express-handlebars');
const mongojs = require('mongojs');
const dbConfig = require('./config/dbConfig');

class HttpServer {
    constructor(httpConfig, db, showDebug = false) {
        this.config = httpConfig;
        this.port = this.config.port;
        this.server = null;
        this.webApp = null;
        this.io = null;
        this.db = db;
        this.showDebug = showDebug;
    }

    /**
     * start up http server and setup express
     */
    setUpEngine() {

        this.webApp = express();
        this.webApp.engine('.hbs', handlebars({
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

            response.render('home', {
                data: 'test data',
            })
        })
    }

    /**
     * Route to handle list of tweets
     */
    createListTweetRoute() {
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
     * startup http server
     */
    startHttpServer() {
        this.setUpEngine();
        this.createListTweetRoute();
        this.createListRetweetRoute();
        this.createListFavoritesRoute();
        this.createHomeRoute();

        this.server.listen(this.port, this.onServerStarted.bind(this));

    }


}

module.exports = HttpServer;