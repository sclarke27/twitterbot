/**
 * Init class for plant page
 * @since 1.0.0
 */
class PlantPage extends BasePage {
    constructor(parentDiv, routeName) {
        super(parentDiv, routeName);
        this.frameIntervalMS = 200;
        this.swimUrl = 'ws://127.0.0.1:5620' // Fallback local service
    }

    /**
     * Store url variable, this url is to connect to websocket
     * @since 1.0.0
     * @param {string} url
     */
    setSwimURL(newUrl) {
        this.swimUrl = newUrl;
    }

    /**
     * Initialize range input function
     * @since 1.0.0
     * @param {string} url
     */
    start(aggregateUrl) {
        super.start(aggregateUrl);
        const rangeLight = new PlantRange(this.swimUrl, this.parentDiv, 'light');
        const rangeSoil = new PlantRange(this.swimUrl, this.parentDiv, 'soil');
        const rangeTemp = new PlantRange(this.swimUrl, this.parentDiv, 'temperatureCh1');
        const alertSetting = new AlertSetting(this.swimUrl, this.parentDiv, [rangeLight, rangeSoil, rangeTemp]);
    }

    /**
     * Refresh page
     * @since 1.0.0
     */
    refreshPage() {
        super.refreshPage();
    }

    /**
     * Refresh data
     * @since 1.0.0
     */
    refreshData() {
        super.refreshData();
        this.refreshPage();
    }
}

/**
 * Initialize range display or hide
 * @since 1.0.0
 */
class AlertSetting {
    constructor(swimUrl, parentView, ranges) {
        this.parentView = parentView;
        this.ranges = ranges;
        this.swimUrl = swimUrl;

        // Connect to swim service and check for value
        const alertOpenValue = swim.downlinkValue()
            .host(this.swimUrl)
            .node(`sensor/light`)
            .lane('option')
            .didSet(this.onAlertOpen.bind(this))
            .open();
    }

    /**
     * Check if the range inpput wrapper to show or not. Applying the wrapper with class
     * @since 1.0.0
     * @param {number} value between 0-1
     */
    onAlertOpen(value) {
        const className = 'alert-setting';
        if(value === 1) {
            this.parentView.classList.add(className)
            this.ranges.forEach((range)=> {
                range.rangeResize();
            });
        } else {
            this.parentView.classList.remove(className);
        }
    }
}

/**
 * Cutom plant input field function for rannge sending data to swim services
 * @since 1.0.0
 */
class PlantRange {
    constructor(swimUrl, parentView, type) {
        this.parentView = parentView;
        this.boxView = parentView.querySelector(`.box-${type}`);
        this.swimUrl = swimUrl;
        this.type = type;
        this.rangeClick = false;
        this.barInterval = null;

        this.iconAlert = this.boxView.querySelector('.alert-wrap');
        this.iconAlertValue = this.iconAlert.querySelector('.value');

        this.inputSetting = this.parentView.querySelector('.alert-setting')
        this.iconAlert.addEventListener("click", this.onAlertClick.bind(this))

        // Connect to swim service and check for value
        const alertValue = swim.downlinkValue()
            .host(this.swimUrl)
            .node(`sensor/${this.type}`)
            .lane('alert')
            .didSet(this.onAlertChange.bind(this))
            .open();

        this.inputRange = this.boxView.querySelector('.input-range');
        this.inputRange.addEventListener('mouseup', this.onRangeMouseup.bind(this));
        this.inputRange.addEventListener('input',  this.onRangeMousedown.bind(this));

        // Connect to swim service and check for value
        const inputValue = swim.downlinkValue()
            .host(this.swimUrl)
            .node(`sensor/${this.type}`)
            .lane('threshold')
            .didSet(this.onValueChange.bind(this))
            .open();

        this.rangeWrap = this.boxView.querySelector('.range-wrap');
        this.rangeMeter = this.boxView.querySelector('.range-wrap .meter');

        window.addEventListener('resize', this.rangeResize.bind(this));
        this.rangeResize();
    }

    /**
     * Dynamic height for range when range is vertical.
     * Was not able to do this in css.
     * @since 1.0.0
     */
    rangeResize() {
        const height = this.rangeWrap.offsetHeight;
        this.inputRange.style.width = `${height + 20}px`;
    }

    /**
     * Clicl event that send {0,1} to siwm service for alert
     * @since 1.0.0
     */
    onAlertClick() {
        const value = (this.inputSetting.value === '0')? 1 : 0;
        this.updateOption('light', value);
    }

    /**
     * Check if there is an alert and apply class to parent view
     * @stylesheeet .alert-box-{tyoe}
     * @since 1.0.0
     * @param {boolean}
     */
    onAlertChange(value) {
        (value)? this.parentView.classList.add(`alert-box-${this.type}`) : this.parentView.classList.remove(`alert-box-${this.type}`);
    }

    /**
     * Change range input base on incoming value
     * @since 1.0.0
     * @param {number} range current state
     */
    onValueChange(value) {
        value = value || 0; // fallback if value is undefined
        if(!this.rangeClick) {
            this.inputRange.value = value;
            this.onRangeBarChange(value);
        }
    }

    /**
     * Mouse down on range input,send the value to swim service
     * @since 1.0.0
     */
    onRangeMousedown() {
        this.rangeClick = true;
        this.value = this.inputRange.value;
        this.onRangeBarChange(this.inputRange.value);
        this.updateThreshold(this.type, this.inputRange.value);
    }

    /**
     * Mouse up on range input, set click false
     * @since 1.0.0
     */
    onRangeMouseup() {
        // set timeout is to prevent on value change to prevent input jumping
        // We already set the new value no need to tigger onValueChange again. and prevent spaming
        setTimeout(() => {
            this.rangeClick = false;
        }, 100);
    }

    /**
     * Upadte text and range input
     * @param {string} data value
     * @since 1.0.0
     */
    onRangeBarChange(value) {
        let percent = value;
        if(this.type === 'light' || this.type === 'soil') {
            percent = value/10
        }
        if(this.type === 'soil') {
            value = value/10
        }
        this.iconAlertValue.innerText = Math.round(value);
        this.rangeMeter.style.height = `${percent}%`;
    }

    /**
     * Update swim service for threshold
     * @param {string} swim node
     * @param {number} set option value
     * @since 1.0.0
     */
    updateThreshold(sensorServiceName, value) {
        swim.client.command(this.swimUrl, `/sensor/${sensorServiceName}`, `setThreshold`, value);
    }

    /**
     * Update swim service for option
     * @param {string} swim node
     * @param {number} set option value
     * @since 1.0.0
     */
    updateOption(sensorServiceName, value) {
        swim.client.command(this.swimUrl, `/sensor/${sensorServiceName}`, 'setOption', value);
    }
}
