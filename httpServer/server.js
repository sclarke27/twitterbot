const express = require('express');
const http = require('http').Server(express);
const path = require('path');
const expressHandlebars = require('express-handlebars');
const mongojs = require('mongojs');
const dbConfig = require('./config/dbConfig');
const net = require('net');
const WebSocket = require('ws');

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
        this.main = null;
        this.useSwim = true;

        this.botList = [];
    }

    openSwimSocket() {

        if(this.useSwim) {
            console.info('[swim] open socket to swim service');
            try {
                this.socketClient = new WebSocket('ws://127.0.0.1:5620');
                this.socketClient.on('close', (closed) => {
                    console.info('socket closed: ' + closed);
                    setTimeout(() => { this.openSwimSocket() }, 1000);
                });
                this.socketClient.on('error', (err) => {
                    console.info('socket error');
                    console.info(err);
                });
                this.socketClient.on('open', () => {
                    console.info('socket open');
                });
            } catch (err) {
                console.error(err);
            }
        }
        
    }    

    /**
     * start up http server and setup express
     */
    setUpEngine() {

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

            client.on('disconnect', () => {
                if (this.showDebug) {
                    console.info('[httpServer] user socket disconnected');
                }
            });
        })

        this.openSwimSocket();

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

        if (this.db) {
            this.db.bots.find().sort({
                botName: -1
            }).toArray((err, docs) => {
                this.botList = docs;
            });
        }


    }

    /**
     * 
     */
    sendSocketMessage(messageKey, messageData) {
        if (this.useSwim && this.socketClient && this.socketClient.send) {

            try {
                // console.info('[swim] send socket message');
                // console.info(JSON.stringify(messageData));
                if(this.socketClient.readyState) {
                
                    for(const dataKey in messageData) {
                        // console.log(dataKey, messageData[dataKey]);
                        this.socketClient.send("@command(node:'/sensor/" + dataKey + "',lane:'addLatest'){" + messageData[dataKey] + "}", () => {
                            // console.info(data);
                        });
                    }
                } else {
                    console.info('ready state not 1')
                    console.info(this.socketClient.readyState);
                }
                
            } catch (err) {
                console.info('[swim] socket error');
                console.info(err);
            }
        } else {
            // console.error('[swim] socket not connected');
        }
        // this.io.emit(messageKey, messageData);
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
            
            response.render('homePage', {
                routeName: 'home',
                botList: [],
                helpers: this.hbsHelpers
            })                
        
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
    /**
     * startup http server
     */
    startHttpServer(mainThread) {
        this.main = mainThread;
        this.setUpEngine();
        this.createHomeRoute();

        this.server.listen(this.port, this.onServerStarted.bind(this));

    }


}

module.exports = HttpServer;