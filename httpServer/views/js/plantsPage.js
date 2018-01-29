class PlantsPage extends BasePage {
    constructor(parentDiv, routeName, botName, plantId) {
        super(parentDiv, routeName, botName);

        this.plantId = plantId;

        this.plantHistoryData = null;
        this.plantHistoryDataDiv = null;

        this.dataPanel = null;
        this.dataPanelConfig = {
            title: 'Plant 1',
            headerBgColor: "rgba(0, 255, 0, 0.07)",
            dataItems: [
                // {
                //     title: 'Air Temperature',
                //     sensorKey: 'tempurature',
                //     controlClass: ThermometerControl
                // },
                {
                    title: 'moisture',
                    sensorKey: 'moisture',
                    controlClass: ThermometerControl
                },
                {
                    title: 'Light',
                    sensorKey: 'light',
                    controlClass: ThermometerControl
                },
                {
                    title: 'Temp',
                    sensorKey: 'temperature',
                    controlClass: ThermometerControl
                },
                {
                    title: 'Pressure',
                    sensorKey: 'pressure',
                    controlClass: ThermometerControl
                }
            ],
        }

    }

    start() {
        console.info(`start plant page ${this.plantId}`);

        this.plantHistoryDataDiv = document.getElementById('plantHistory')
        this.plantHistoryDataDiv.innerHTML = "Loading data"
        const instData = {
            plant1: {
                moisture: {
                    min: 300,
                    max: 900,
                    current: 0
                },
                light: {
                    min: 0,
                    max: 1000,
                    current: 0
                },
                temperature: {
                    min: 0,
                    max: 100,
                    current: 0
                },
                pressure: {
                    min: 20,
                    max: 120,
                    current: 0
                }
            }
        }
        this.dataPanel = new InstrumentPanel(this.dataPanelConfig, 'plantDash');
        this.dataPanel.show(instData['plant1']);

        const socket = io();
        socket.on('connect', (data) => {
            socket.emit('join', 'Hello World from client');
        });
        socket.on('plantUpdate', (returnData) => {
            const sensorData = {
                plant1: {
                    moisture: {
                        min: 300,
                        max: 900,
                        current: returnData.moisture
                    },
                    light: {
                        min: 0,
                        max: 1000,
                        current: returnData.light
                    },
                    temperature: {
                        min: 0,
                        max: 100,
                        current: returnData.temperature
                    },
                    pressure: {
                        min: 20,
                        max: 120,
                        current: returnData.pressure / 10
                    }
                }
            }

            this.dataPanel.update(sensorData['plant1']);
            // const sensorData = returnData.data;
            // const sensorKeys = Object.keys(sensorData);
            // const statusData = returnData.status;
            // const statusKeys = Object.keys(statusData);
            // for (const panelKey of Object.keys(dashItems)) {
            //     const panel = dashItems[panelKey];
            //     panel.control.update(sensorData);
            // }
            // const dashItems = this.instPanelConfig;

            // // for (const panelKey of Object.keys(this.instPanelConfig)) {
            // const panel = new InstrumentPanel(this.dataPanelConfig, 'plantDash');
            // panel.show(instData['plant1']);
            // // }

        });

        super.start();
    }

    fetchPlantHistory() {
        this.fetchData(`/plants/history/${this.plantId}`)
            .then((results) => {
                console.info(`[PlantsPage] - /plants/history/${this.plantId} - `, results);
                if (results.data) {
                    const firstItem = results.data[0];
                    const sensorData = {
                        plant1: {
                            moisture: {
                                min: 300,
                                max: 900,
                                current: firstItem.moisture
                            },
                            light: {
                                min: 0,
                                max: 1000,
                                current: firstItem.light
                            },
                            temperature: {
                                min: 0,
                                max: 100,
                                current: firstItem.temperature
                            },
                            pressure: {
                                min: 20,
                                max: 120,
                                current: firstItem.pressure / 10
                            }
                        }
                    }
                    console.info(results.data);
                    this.dataPanel.update(sensorData['plant1']);


                    this.plantHistoryData = results.data;
                    this.refreshList('Sensor History', this.plantHistoryDataDiv, this.plantHistoryData);
                }
            })
    }

    refreshPageData() {

        super.refreshPageData();

        this.fetchPlantHistory();
        setInterval(this.fetchPlantHistory.bind(this), 240000);

    }

}