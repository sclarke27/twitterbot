const Utils = require('../modules/utils');

class BaseBot {

    constructor(botConfig, showDebug = false, arduino = null) {
        this.showDebug = showDebug;
        this.config = botConfig;
        this.arduino = arduino;


        if (this.showDebug) {
            console.info(`[BaseBot] constructed`);
        }


    }

    start() {
        if (this.config.enabled) {
            if (this.showDebug) {
                console.info(`[BaseBot] start`);
            }

        }

    }

    end() {
        if (this.showDebug) {
            console.info(`[BaseBot] end`);
        }
    }

}

module.exports = BaseBot;