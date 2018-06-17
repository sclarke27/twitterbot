console.info('[main] Loading libraries ...');

// servers
const httpServer = require('./httpServer/server');

// other libs
const ArduinoBoard = require('./modules/ArduinoBoard');
const commandLineArgs = process.argv

console.info('[main] Libraries loaded');

class Main {
    constructor() {
        this.botList = [];
        this.servicesList = [];
        this.httpServer = null;
        this.serviceConfig = null;
        this.args = {};
        this.arduino = null;

        this.processCommandLineArgs();
        this.loadConfig(this.args.config || 'localhost')

        if (this.showDebug) {
            console.info('[main] constructed');
        }
    }

    loadConfig(configName) {
        if (this.showDebug) {
            console.info('[main] load config');
        }
        this.serviceConfig = require('../config/node/'+configName+'Config.js');
        this.showDebug = this.serviceConfig.showDebug;
        const botList = [];
        const servicesList = [];
        
        if(this.serviceConfig.plantConfig.bot.enabled) {
            const PlantBot = require('./bots/plantBot');
            botList.push([PlantBot, this.serviceConfig.plantConfig.bot]);
        }
        
        if(this.serviceConfig.catBotConfig.bot.enabled) {
            const CatBot = require('./bots/catBot');
            botList.push([CatBot, this.serviceConfig.catBotConfig.bot]);
        }
        
        if(this.serviceConfig.dogBotConfig.bot.enabled) {
            const DogBot = require('./bots/dogBot');
            botList.push([DogBot, this.serviceConfig.dogBotConfig.bot]);
        }
        
        if(this.serviceConfig.plantConfig.service.enabled) {
            const PlantMonService = require('./services/plantMonService');
            servicesList.push([PlantMonService, this.serviceConfig.plantConfig.service]);
        }
        
        if (this.showDebug) {
            console.info('[main] config loaded');
        }
        this.initialize(botList, servicesList);        
    }

    processCommandLineArgs() {
        commandLineArgs.forEach((val, index, arr) => {
            if(val.indexOf('=') > 0) {
                const rowValue = val.split('=');
                this.args[rowValue[0]] = rowValue[1];
            }
        })
    }

    initialize(botList, servicesList) {
        if (this.showDebug) {
            console.info('[main] initialize');
        }
        // start http server
        if (this.serviceConfig.httpEnabled) {
            this._httpServer = new httpServer(this.serviceConfig, this.showDebug);
            this._httpServer.startHttpServer(this);
        }

        // start ardunio connection
        if(this.serviceConfig.plantConfig.bot.enabled || this.serviceConfig.plantConfig.service.enabled) {
            this.arduino = new ArduinoBoard(false);
            this.arduino.startPort(this.serviceConfig.plantConfig.service.baud);
        }
        
        if (servicesList) {
            for (const service of servicesList) {
                const serviceClass = service[0];
                const serviceConfig = service[1];
                this.servicesList.push(new serviceClass(serviceConfig, this._httpServer, this.showDebug, this.arduino));
            }
        }

        // create the bots and push to this.botList
        for (const startingBot of botList) {
            const botClass = startingBot[0];
            const botConfig = startingBot[1];
            this.botList.push(new botClass(botConfig, this.showDebug, this.arduino));
        }
        
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

const main = new Main();
main.start();