const TwitterBot = require('./twitterBot');

class DogBot extends TwitterBot {

    constructor(botConfig, db, showDebug = false) {
        super(botConfig, db, showDebug);
        if (this.showDebug) {
            console.info(`[DogBot] constructor`);
        }
    }

}

module.exports = DogBot;