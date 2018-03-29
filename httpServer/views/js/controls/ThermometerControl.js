class ThermometerControl {

    constructor(mainTitle, minValue, maxValue, currentValue, targetElement) {
        // data values
        this._mainTitleValue = mainTitle;
        this._minValue = minValue;
        this._maxValue = maxValue;
        this._currentValue = currentValue;
        // html elements
        this._targetElement = targetElement;
        this._mainWrapperElem = null;
        this._mainTitleElem = null;
        this._outerSliderElem = null;
        this._innerSliderElem = null;
        this._dataLabelElem = null;

    }

    show() {
        this._mainWrapperElem = document.createElement('div');
        this._mainWrapperElem.className = 'thermWrapper';

        this._mainTitleElem = document.createElement('div');
        this._mainTitleElem.className = 'titleLabel';
        this._mainTitleElem.innerText = this._mainTitleValue;
        this._mainWrapperElem.appendChild(this._mainTitleElem);

        this._outerSliderElem = document.createElement('div');
        this._outerSliderElem.className = 'thermOutside';

        this._innerSliderElem = document.createElement('div');
        this._innerSliderElem.className = 'thermInside';

        this._dataLabelElem = document.createElement('label');
        this._dataLabelElem.innerText = this._currentValue;

        this._innerSliderElem.appendChild(this._dataLabelElem);
        this._outerSliderElem.appendChild(this._innerSliderElem);
        this._mainWrapperElem.appendChild(this._outerSliderElem);

        this._targetElement.appendChild(this._mainWrapperElem);
    }

    update(currentValue) {
        if (Number(currentValue).toPrecision(4) === this._currentValue) return;
        this._currentValue = Number(currentValue).toPrecision(4);

        const valuePercent = this._currentValue / this._maxValue * 100;

        this._innerSliderElem.style.height = `${valuePercent}%`;
        const newBgColor = `hsla(${valuePercent}, 100%, 50%, 0.8)`;
        this._innerSliderElem.style.backgroundColor = newBgColor;
        this._dataLabelElem.innerHTML = `${this._currentValue}`;
        if (this._mainTitleElem.innerText === this._mainTitleValue) {
            this._mainTitleElem.innerText = this._mainTitleValue
        }

    }

}