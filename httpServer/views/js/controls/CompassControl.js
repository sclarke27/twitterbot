/**
 * Class to draw compass style control
 */
class CompassControl {
    constructor(mainTitle, minValue, maxValue, currentValue, targetElement) {
        this._mainTitle = mainTitle;
        this._minValue = minValue;
        this._maxValue = maxValue;
        this._currentValue = currentValue;
        this._targetElement = targetElement;
        this._mainElem = null;
        this._compassCircleElem = null;
        this._dataLabelElem = null;
    }

    show() {
        this._mainElem = document.createElement('div');
        this._mainElem.className = 'compass';

        this._compassCircleElem = document.createElement('div');
        this._compassCircleElem.className = 'compassCircle';
        this._compassCircleElem.innerText = '^';
        this._mainElem.appendChild(this._compassCircleElem);

        this._dataLabelElem = document.createElement('span');
        this._dataLabelElem.className = "compassLabel";
        this._mainElem.appendChild(this._dataLabelElem);

        this._targetElement.appendChild(this._mainElem);
        this.update(this._currentValue);
    }

    update(currentValue) {
        if (currentValue === this._currentValue) return;
        this._currentValue = currentValue;
        this._dataLabelElem.innerText = this._currentValue;
        this._compassCircleElem.style.transform = `rotate(${this._currentValue}deg)`;
    }
}