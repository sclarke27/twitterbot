class InstrumentPanel {
    constructor(panelData, targetElementId) {
        this._mainTitle = panelData.title;
        this._dataItems = panelData.dataItems;
        this._headerBgColor = panelData.headerBgColor || "";
        this._targetElementId = targetElementId;
        this._panelMainElem = null;
        this._panelTitleElem = null;
        this._panelInstRow = null;
    }

    show(sensorData) {
        this._targetElement = document.getElementById(this._targetElementId)

        this._panelMainElem = document.createElement('span');
        this._panelMainElem.className = 'instPanel';

        this._panelTitleElem = document.createElement('h1');
        this._panelTitleElem.innerText = this._mainTitle;
        this._panelTitleElem.style.backgroundColor = this._headerBgColor;
        this._panelMainElem.appendChild(this._panelTitleElem);

        this._panelInstRow = document.createElement('div');
        this._panelInstRow.className = "instRow";
        this._panelMainElem.appendChild(this._panelInstRow);

        for (const dataItem of this._dataItems) {
            if (dataItem.controlClass === VideoFeed) {
                dataItem.control = new VideoFeed(dataItem.title, dataItem.videoUrl, this._panelInstRow);
            } else {
                dataItem.control = new dataItem.controlClass(dataItem.title, sensorData[dataItem.sensorKey].min, sensorData[dataItem.sensorKey].max, sensorData[dataItem.sensorKey].current, this._panelInstRow);
            }
            dataItem.control.show();
        }

        this._targetElement.appendChild(this._panelMainElem);
    }

    update(sensorData) {
        for (const dataItem of this._dataItems) {
            if (dataItem.control) {
                if (dataItem.controlClass !== VideoFeed) {
                    dataItem.control.update(sensorData[dataItem.sensorKey].current);
                }
            }
        }
    }

}

//module.exports = InstrumentPanel;