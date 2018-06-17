const TwitterBot = require('./twitterBot');

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