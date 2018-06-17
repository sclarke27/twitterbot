class ZonesPage extends BasePage {
    constructor(parentDiv, routeName) {
        super(parentDiv, routeName);
        this.aggregateDeviceList = {};
        this.zoneViewTemplate = null;
        this.mainContainer = null;
    }

    start(aggregateUrl) {
        console.info('start zones page');
        super.start(aggregateUrl);
        this.zoneViewTemplate = document.getElementById('zoneTemplate').innerText;
        this.mainContainer = document.getElementById('mainContainer');
        window.requestAnimationFrame(() => {
            this.refreshPage();
        })
    }

    refreshPage() {
        super.refreshPage();
        for(const device in this.aggregateDeviceList) {
            if(device && device.updateView) {
                device.updateView();
            }
        }
        window.requestAnimationFrame(() => {
            this.refreshPage();
        })       
    }

    materializeTemplate(template, data) {
        for(const dataItem in data) {
            template = template.replace(`[${dataItem}]`, data[dataItem]);
        }
        const scriptTag = document.createElement('script');
        scriptTag.type = 'text/recon';
        scriptTag.innerText = template;
        this.mainContainer.appendChild(scriptTag);
        swim.UiForm.Global.materializeScript(scriptTag); 
        return scriptTag;
    }

    refreshData() {
        const deviceListingForm = document.getElementById('deviceListing');
        
        if(deviceListingForm) {
            for(const formItem of deviceListingForm.elements) {
                if((formItem.value.indexOf('|') >= 0)) {
                    const valueSplit = formItem.value.split('|');
                    const aggName = valueSplit[0];
                    const aggAddress = valueSplit[1];
                    const parentDiv = formItem.parentElement;
                    if(!this.aggregateDeviceList[aggName]) {
                        const replacementData = { 
                            host: `ws://${aggAddress.split(':')[0]}:5620`, 
                            hostLink: `http://${aggAddress}/aggregate`,
                            hostName: aggName
                        }
                        this.aggregateDeviceList[aggName] = this.materializeTemplate(this.zoneViewTemplate, replacementData);
                    } 
                }
            }
        }
        super.refreshData();
    }
}

//this is no longer used but is still a good example of creating links to other swim services
class AggregateDevice {
    constructor(botName, botAddress, parentDiv) {
        this.parentDiv = parentDiv;
        this.botName = botName;
        this.botAddress = `ws://${botAddress.split(':')[0]}:5620`
        console.info(botName, botAddress);

        this.botList = {};
        this.plantList = {};
        this.alertCount = 0;
        this.mainChart = null;

        this.plantDataLink = swim.downlinkMap().host(this.botAddress).node('/aggregate').lane('join/latest')
        .didUpdate((key, value) => {
            const botData = value;
            const botKey = key.split('|');
            const botName = botKey[0];
            const botIp = botKey[1].split(':')[0];
            this.plantList[botName] = {
                fullKey: botData.key,
                name: botName,
                ip: botIp,
                data: botData
            }
            
            // console.info('aggregateData', this.plantList)
        })
        // this.robotDataLink = swim.downlinkMap().host(this.botAddress).node('/aggregate').lane('join/robot')
        // .didUpdate((key, value) => {
        //     const botData = key;
        //     const botKey = botData.key.split('|');
        //     const botName = botKey[0];
        //     const botIp = botKey[1].split(':')[0];
        //     this.botList[botName] = {
        //         fullKey: botData.key,
        //         name: botName,
        //         ip: botIp,
        //         status: value,
        //         data: botData
        //     }
        //     // console.info('robotData', this.botList)
        // })

        this.lightAverageLink = swim.downlinkMap().host(this.botAddress).node('/aggregate').lane('avg/light')
        .didUpdate((key, value) => {
            // console.info('light', key, value);
        })

        this.tempAverageLink = swim.downlinkMap().host(this.botAddress).node('/aggregate').lane('avg/temp')
        .didUpdate((key, value) => {
            // console.info('temp', key, value);
        })

        this.soilAverageLink = swim.downlinkMap().host(this.botAddress).node('/aggregate').lane('avg/soil')
        .didUpdate((key, value) => {
            // console.info('soil', key, value);
        })        

        this.totalAlertsLink = swim.downlinkValue().host(this.botAddress).node('/aggregate').lane('totalAlert')
        .didSet((value) => {
            if(this.alertCount !== value) {
                this.alertCount = value;
                // console.info('alert count', value);
            }
        })        

    }

    findInChildren(elementId, childrenList) {
        if(childrenList && childrenList.length > 0) {
            for(const childElement of childrenList) {
                if(childElement.id === elementId) {
                    return childElement;
                }
                if(childElement.children && childElement.children.length > 0) {
                    this.findInChildren(elementId, childElement.children);
                }
            }
        }
        return null;
    }

    start() {
        this.plantDataLink.open();
        this.robotDataLink.open();
        this.lightAverageLink.open();
        this.tempAverageLink.open();
        this.soilAverageLink.open();
        this.totalAlertsLink.open();
        this.mainChart = this.findInChildren('zoneAveragesChart', this.parentDiv.children);
        this.linePlot = swim.ui.chart.LinePlot.create();
        console.info(this.mainChart, this.linePlot);
    }

    updateView() {

    }

    updateAddress(newAddress) {
        if(this.botAddress !== newAddress) {
            this.botAddress = newAddress;
        }
    }

    getChildDeviceList() {
        
    }
}