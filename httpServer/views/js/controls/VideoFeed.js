/**
 * Class to render a video feed from a webcam
 */
class VideoFeed {

    /**
     * class constructor
     * @param {*} mainTitle 
     * @param {*} cameraUrl 
     * @param {*} targetElement 
     */
    constructor(mainTitle, cameraUrl, targetElement) {
        // data values
        this._mainTitleValue = mainTitle;
        this._camUrl = cameraUrl;

        // html elements
        this._targetElement = targetElement;
        this._mainWrapperElem = null;
        this._mainTitleElem = null;
        this._videoElem = null;

    }

    /**
     * render html
     */
    show() {
        this._mainWrapperElem = document.createElement('div');
        this._mainWrapperElem.className = 'videoWrapper';

        this._videoElem = document.createElement('div');
        this._videoElem.className = 'video';
        this._videoElem.style.backgroundImage = `url(${this._camUrl})`;
        this._mainWrapperElem.appendChild(this._videoElem);

        this._targetElement.appendChild(this._mainWrapperElem);

    }

    /**
     * update data/html
     */
    update() {

    }

}