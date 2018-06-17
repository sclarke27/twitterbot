class BasePage {
    constructor(parentDiv, routeName, aggregateUrl) {
        this.botData = {};
        this.botsList = {};
        this.parentDiv = parentDiv;
        this.routeName = routeName;
        this.frameTimeout = null;
        this.frameIntervalMS = 500;
        this.botsContainer = null;
        this.botsWrap = null;
        this.botsRow = null;
        this.botDefaultCount = 8;
        this.botCol = [];
        this.rawBotList = {};

    }

    start(aggregateUrl) {
        this.aggregateUrl = aggregateUrl;
        if(this.aggregateUrl) {
            this.robotDataLink = swim.downlinkMap().host(this.aggregateUrl).node('/aggregate').lane('join/robot')
            .didUpdate((key, value) => {
                const botData = key;
                const botKey = botData.key.split('|');
                const botName = botKey[0];
                const botIp = botKey[1].split(':')[0];
                this.rawBotList[botName] = {
                    fullKey: botData.key,
                    name: botName,
                    ip: botIp,
                    status: value,
                    data: botData
                }
                // console.info('robotData', this.rawBotList)
            })
            this.robotDataLink.open();
        }

        this.botsContainer = document.createElement("div");
        this.botsContainer.className = "botsContainer";

        this.botsWrap = document.createElement("div");
        this.botsWrap.className = "botBox container-fluid";
        this.botsContainer.appendChild(this.botsWrap);

        this.botsRow = document.createElement("div");
        this.botsRow.className = "row boxRow";
        this.botsWrap.appendChild(this.botsRow);

        const botHeader = document.createElement("div");
        botHeader.className = "col col-12 botHeader";
        botHeader.innerHTML = `
            <div class="row">
                <div class="col col-6"><h2>Bots</h2></div>
                <div class="col col-6">(<span class="botCount">0</span>)</div>
            </div>
        `;
        this.botsRow.appendChild(botHeader);

        for(let i = 0; i < this.botDefaultCount; i++) {
            const tempDiv = document.createElement('div');
            tempDiv.className = 'col col-12 col-md-6 box';
            this.botCol[i] = tempDiv;
            tempDiv.onclick = `console.info('test');`;
            this.botsRow.appendChild(tempDiv);

            const squareDiv = document.createElement('div');
            squareDiv.className = 'square';
            squareDiv.setAttribute('data-index', i + 1)
            tempDiv.appendChild(squareDiv);
        }

        if(this.botsContainer) {
            const botMenuDiv = document.getElementById('botMenu');
            botMenuDiv.appendChild(this.botsContainer);
        }

        this.refreshData();
    }

    loadingText(dataName) {
        return `<h3 class="loadingText">Loading ${dataName} Data...<h3>`
    }

    createBot(bot, targetContainer) {
        const newBot = new Bot(bot, this.botData[bot], targetContainer);
        newBot.start();
        return newBot;
    }

    refreshPage() {
        let botCounter = 0
        for(const bot in this.botData) {

            const currBotData = this.botData[bot];
            const currBot = this.botsList[bot];

            if(!currBot) {

                // to find out where to append
                let targetContainer = null;
                switch(this.botData[bot].type) {
                    case 'bot':
                        targetContainer = this.botCol[botCounter].querySelector('.square');
                        botCounter++;
                        document.querySelector('.botHeader .botCount').innerHTML = botCounter;
                        break;
                }

                if(targetContainer !== null) {
                    this.botsList[bot] = this.createBot(bot, targetContainer);
                }
            }
            if(currBotData.dirty) {
                if(this.botsList[bot]) {
                    this.botsList[bot].updateData(currBotData);
                }

                currBotData.dirty = false;
            }
        }
    }

    refreshData() {
        let dataChanged = false;
        for(const currForm of document.forms) {
            for(const currValues of currForm.children) {

                if(currForm.id && currForm.id.indexOf('|') > 0) {
                    const botKey = currForm.id;
                    const keySplit = botKey.split('|');
                    const botName = keySplit[0];
                    const botAddress = keySplit[1];

                    if(!this.botData[botName]) {
                        this.botData[botName] = {
                            name: botName,
                            address: botAddress,
                            type: null,
                            dirty: true,
                        };
                        if(botName.indexOf('Agg') >= 0) {
                            this.botData[botName]['type'] = 'aggregator'
                        }
                        if(botName.indexOf('Plant') >= 0) {
                            this.botData[botName]['type'] = 'plant'
                        }
                        if(botName.indexOf('Bot') >= 0) {
                            this.botData[botName]['type'] = 'bot'
                        }

                    }
                    if(!this.botData[botName][currValues.name]) {
                        this.botData[botName][currValues.name] = {currentValue: 0, hasAlert: false};
                    }
                    if(this.botData[botName][currValues.name] !== currValues.value) {
                        this.botData[botName][currValues.name] = {currentValue: currValues.value, hasAlert: (currValues.dataset.hasAlert == 'true' || false)};
                        this.botData[botName]['dirty'] = true;
                        dataChanged = true;
                    }

                }
            }
        }
        for(const bot in this.rawBotList) {
            const botInfo = this.rawBotList[bot];
            this.botData[bot] = {
                name: bot,
                address: botInfo.fullKey.split('|')[1],
                type: null,
                dirty: true,
            };
            if(bot.indexOf('Agg') >= 0) {
                this.botData[bot]['type'] = 'aggregator'
            }
            if(bot.indexOf('Plant') >= 0) {
                this.botData[bot]['type'] = 'plant'
            }
            if(bot.indexOf('Bot') >= 0) {
                this.botData[bot]['type'] = 'bot'
            }
            dataChanged = true;
        }
        if(Object.keys(this.botData).length > 0 && dataChanged) {
            this.refreshPage();
        }

        if(this.frameTimeout !== null) {
            clearTimeout(this.frameTimeout);
            this.frameTimeout = null;
        }

        this.frameTimeout = setTimeout(() => {
            requestAnimationFrame(this.refreshData.bind(this));
        }, this.frameIntervalMS);
    }

    /**
     * Using Es6 fetch - Post back to node server
     * Doesn't support IE 11
     * @since 1.0.0
     * @param {string} url
     * @returns {Object} Returns the aggregate object.
     */
    fetchData(dataUrl) {
        return fetch(`${dataUrl}`, {
                method: 'POST',
                body: 'json',
                headers: {}
            })
            .then(function (response) {
                //convert server response to json
                return response.json();
            })
            .then(function (returnData) {
                return returnData;
            });
    }
}
