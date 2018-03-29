class BasePage {
    constructor(parentDiv, routeName, botName) {
        this.parentDiv = parentDiv;
        this.routeName = routeName;
        this.botName = botName;

        console.info('base', parentDiv, routeName, botName)
    }

    start() {
        console.info('start base page');
        this.refreshPageData();
        setInterval(this.refreshPageData.bind(this), 1000 * 60 * 60);
    }

    loadingText(dataName) {
        return `<h3 class="loadingText">Loading ${dataName} Data...<h3>`
    }

    refreshPageData() {

    }

    refreshList(listName, targetDiv, dataList) {
        targetDiv.innerText = "";

        const header = document.createElement('div');
        header.innerHTML = `${listName}: ${dataList.length}`;
        header.className = 'containerHeader';
        targetDiv.appendChild(header);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'row header';
        for (const dataItem in dataList[0]) {
            if (dataItem !== 'serverError' && dataItem !== 'serverResponse' && dataItem !== '_id' && dataItem !== 'plantId') {
                const dataDiv = document.createElement('div');
                dataDiv.innerText = dataItem;
                dataDiv.className = `dataItem ${dataItem}`;
                headerDiv.appendChild(dataDiv);
            }
        }
        targetDiv.appendChild(headerDiv)

        const scrollerDiv = document.createElement('div');
        scrollerDiv.className = 'scroller';

        for (const listIndex in dataList) {
            const rowData = dataList[listIndex];
            const rowDiv = document.createElement('div');
            rowDiv.className = "row"
            for (const dataItem in rowData) {
                if (dataItem !== 'serverError' && dataItem !== 'serverResponse' && dataItem !== '_id' && dataItem !== 'rawData' && dataItem !== 'plantId') {
                    const dataDiv = document.createElement('div');
                    if (dataItem.indexOf('imestamp') >= 0) {
                        dataDiv.innerText = moment(rowData[dataItem]).fromNow();
                    } else {
                        dataDiv.innerText = rowData[dataItem];
                    }
                    dataDiv.className = `dataItem ${dataItem}`;
                    if (dataItem.indexOf('is') === 0) {
                        dataDiv.style.backgroundColor = (rowData[dataItem] === true) ? 'rgba(0,200,0,0.5)' : 'rgba(200,0,0,0.5)';
                    }
                    if (dataItem.indexOf('isEnabled') === 0) {
                        dataDiv.onclick = () => {
                            this.fetchData(`/toggleBot/${rowData['Bot Name']}/${rowData['isEnabled']}`)
                                .then(() => {

                                })
                            this.refreshBotData();
                            console.info(rowData['Bot Name']);
                        }
                    }
                    if (dataItem === 'hadError') {
                        dataDiv.style.backgroundColor = (rowData[dataItem] === false) ? 'rgba(0,200,0,0.5)' : 'rgba(200,0,0,0.5)';
                    }

                    if (dataItem === 'tweetId' && rowData['tweetId']) {
                        dataDiv.className = `dataItem ${dataItem} ${dataDiv.className} clickable`;
                        dataDiv.onclick = () => {
                            window.open(`https://twitter.com/statuses/${rowData['tweetId']}`);
                        }
                    }

                    if (dataItem === 'followerId') {
                        dataDiv.className = `dataItem ${dataItem} ${dataDiv.className} clickable`;
                        dataDiv.onclick = () => {
                            window.open(`https://twitter.com/intent/user?user_id=${rowData[dataItem]}`);
                        }
                    }

                    if (dataItem.toLocaleLowerCase() === 'edit' || dataItem.toLocaleLowerCase() === 'delete') {
                        dataDiv.className = `dataItem ${dataItem} ${dataDiv.className} clickable ${dataItem.toLocaleLowerCase()}Button`;
                        dataDiv.onclick = () => {
                            rowData[dataItem](rowData['_id']);
                        }
                        if (dataItem.toLocaleLowerCase() === 'edit') {
                            dataDiv.innerHTML = '<img src="/assets/document.svg" width="100%" height="100%">';
                        }
                        if (dataItem.toLocaleLowerCase() === 'delete') {
                            dataDiv.innerHTML = '<img src="/assets/icons8-delete-button.png" width="100%" height="100%">';
                        }
                    }

                    if (dataItem === 'botName' || dataItem === 'name' || dataItem === 'Bot Name') {
                        dataDiv.className = `dataItem ${dataItem} ${dataDiv.className} clickable`;
                        dataDiv.onclick = () => {
                            window.location.href = `/bot/${rowData[dataItem]}`;
                        }
                    }

                    rowDiv.appendChild(dataDiv);
                }
            }

            scrollerDiv.appendChild(rowDiv)
        }
        targetDiv.appendChild(scrollerDiv);

    }

    fetchBotsFollowersData(botName) {
        const url = (botName) ? `/followers/${botName}` : `/listBots`
        return this.fetchData(url);
    }

    fetchBotsListData(botName) {
        const url = (botName) ? `/listBots/${botName}` : `/listBots`
        return this.fetchData(url);
    }

    fetchTweetListData(botName) {
        const url = (botName) ? `/listTweets/${botName}` : `/listTweets`
        return this.fetchData(url);
    }

    fetchRetweetListData(botName) {
        const url = (botName) ? `/listRetweets/${botName}` : `/listRetweets`
        return this.fetchData(url);
    }

    fetchFavoritesListData(botName) {
        const url = (botName) ? `/listFavorites/${botName}` : `/listFavorites`
        return this.fetchData(url);
    }

    // post back to node server
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