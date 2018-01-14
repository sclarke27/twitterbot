const TwitterBot = require('./twitterBot');
const Utils = require('../modules/utils');

class CatBot extends TwitterBot {

    constructor(botConfig, showDebug = false) {
        super(botConfig, showDebug);
        if (this.showDebug) {
            console.info(`[CatBot] constructor`);
        }
    }

    start() {
        super.start();
        if (this.showDebug) {
            console.info(`[CatBot] start`);
        }

    }

}

module.exports = CatBot;