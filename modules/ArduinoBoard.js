const SerialPort = require('serialport');

/**
 * [baud description]
 * @type {[type]}
 */
class ArduinoBoard {
    constructor(softwareDebugEnabled = false) {
        this._softwareDebug = softwareDebugEnabled;
        this._port = null;
        this._dataHandler = null;
        if (!this._softwareDebug) {
            this._serialPort = require('serialport');
            this._readline = this._serialPort.parsers.Readline;
            this._parser = new this._readline();
        }
    }

    startPort(baud = 9600) {
        if (!this._softwareDebug) {
            try {
                this._port = new this._serialPort('/dev/ttyACM0', {
                    baudRate: baud
                });
                this._port.pipe(this._parser);

                this._port.on('open', this.onConnectionOpened.bind(this));
                this._port.on('error', this.onError.bind(this));
                this._parser.on('data', this.onData.bind(this));
            } catch (err) {
                console.log(err);
            }
        }
    }

    setDataHandler(handler) {
        this._dataHandler = handler;
    }

    onData(data) {
        if (typeof this._dataHandler === 'function') {
            this._dataHandler(data);
        }
    }

    onConnectionOpened(msg) {
        console.log('Arduino connection opened.', msg);
    }

    onError(err) {
        console.log('Arduino connection error:', err.message);
    }

}

module.exports = ArduinoBoard;