const TwitterBot = require('./twitterBot');

class DogBot extends TwitterBot {

    constructor(botConfig, showDebug = false) {
        super(botConfig, showDebug);
        if (this.showDebug) {
            console.info(`[DogBot] constructor`);
        }
    }

}

module.exports = DogBot;