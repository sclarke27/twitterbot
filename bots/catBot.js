const TwitterBot = require('./twitterBot');
const Utils = require('../modules/utils');

class CatBot extends TwitterBot {

    constructor(botConfig, db, showDebug = false) {
        super(botConfig, db, showDebug);
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