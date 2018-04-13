const Utils = require('../modules/utils');

class BaseService {

    constructor(serviceConfig, db, httpServer, showDebug = false) {
        this.showDebug = showDebug;
        this.config = serviceConfig;
        this.twitterApi = null;
        this.pollingTimeout = null;
        this.db = db;
        this.server = httpServer;

        if (this.showDebug) {
            console.info(`[BaseService] constructed`);
        }
    }

    start() {
        if (this.showDebug) {
            console.info(`[BaseService] start`);
        }

        this.update();
    }

    stop() {
        if (this.showDebug) {
            console.info(`[BaseService] stop`);
        }

    }

    update() {
        if (this.showDebug) {
            console.info(`[BaseService] update`);
        }

        // setup next polling interval
        if (this.config.polling && this.config.polling.enabled && this.config.polling.enabled === true) {
            if (this.showDebug) {
                console.info(`[BaseService] set next interval in ${this.config.polling.interval}ms`);
            }
            this.pollingTimeout = setTimeout(this.update.bind(this), this.config.polling.interval);
        }

    }

}

module.exports = BaseService;