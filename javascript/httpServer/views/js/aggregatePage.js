class AggregatePage extends BasePage {
    constructor(parentDiv, routeName) {
        super(parentDiv, routeName);
        this.planterBoxContent = [];
        this.maxPlants = 7;
        this.pageStarted = false;

        this.planterBoxContainer = null;
        this.colBox = [];
    }

    start(aggregateUrl) {
        this.planterBoxContainer = document.createElement("div");
        this.planterBoxContainer.className = "row planterBoxContainer";
        this.parentDiv.appendChild(this.planterBoxContainer);

        super.start(aggregateUrl);
    }

    refreshPage() {
        super.refreshPage();
        // create placeholder boxes if page not started yet.
        if(!this.pageStarted) {

            // creating box div
            for(let i = 0; i <= this.maxPlants; ++i) {
                const tempDiv = document.createElement('div');
                tempDiv.className = 'col col-12 col-sm-6 col-md-4 col-lg-3 box';
                this.colBox[i] = tempDiv;
                this.planterBoxContainer.appendChild(tempDiv);

                const squareDiv = document.createElement('div');
                squareDiv.className = 'square';
                squareDiv.setAttribute('data-index', i + 1)
                tempDiv.appendChild(squareDiv);
            }

            this.pageStarted = true;
        }

        // update all the bots based on the botData passed in from the form collection
        let counterPlant = 0;
        let counterAggs = 0;
        for(const bot in this.botData) {

            const currBotData = this.botData[bot];
            const currBot = this.botsList[bot];

            if(!currBot) {

                // to find out where to append
                let targetContainer = null;
                switch(this.botData[bot].type) {
                    case 'aggregator':
                        targetContainer = this.colBox[counterAggs].querySelector('.square');
                        counterAggs++;
                        break;
                    default:
                        targetContainer = this.colBox[counterPlant].querySelector('.square');
                        counterPlant++;
                        break;
                }

                if(targetContainer !== null) {
                    this.botsList[bot] = this.createBot(bot, targetContainer);
                }
            }
            if(currBotData.dirty) {
                // console.log('value change', currBotData);
                if(this.botsList[bot]) {
                    this.botsList[bot].updateData(currBotData);
                }

                currBotData.dirty = false;
            }
        }
    }

    refreshData() {
        super.refreshData();
    }
}
