class BasePage {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;

    }

    start() {
        console.info('start base page');
    }

    refreshList(listName, targetDiv, dataList) {
        targetDiv.innerText = "";

        const header = document.createElement('div');
        header.innerHTML = `<h3>${listName}</h3>`;
        targetDiv.appendChild(header);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'row header';
        for (const dataItem in dataList[0]) {
            if (dataItem !== 'serverError' && dataItem !== 'serverResponse' && dataItem !== '_id') {
                const dataDiv = document.createElement('div');
                dataDiv.innerText = dataItem;
                dataDiv.className = "dataItem";
                headerDiv.appendChild(dataDiv);
            }
        }
        targetDiv.appendChild(headerDiv)

        for (const listIndex in dataList) {
            const rowData = dataList[listIndex];
            const rowDiv = document.createElement('div');
            rowDiv.className = "row"
            for (const dataItem in rowData) {
                if (dataItem !== 'serverError' && dataItem !== 'serverResponse' && dataItem !== '_id' && dataItem !== 'rawData') {
                    const dataDiv = document.createElement('div');
                    if (dataItem.indexOf('imestamp') >= 0) {
                        dataDiv.innerText = moment(rowData[dataItem]).fromNow();
                    } else {
                        dataDiv.innerText = rowData[dataItem];
                    }
                    dataDiv.className = "dataItem";
                    if (dataItem.indexOf('is') === 0) {
                        dataDiv.style.backgroundColor = (rowData[dataItem] === true) ? 'rgba(0,200,0,0.5)' : 'rgba(200,0,0,0.5)';
                    }
                    if (dataItem === 'hadError') {
                        dataDiv.style.backgroundColor = (rowData[dataItem] === false) ? 'rgba(0,200,0,0.5)' : 'rgba(200,0,0,0.5)';
                    }

                    if (dataItem === 'tweetId' && rowData['tweetId']) {
                        dataDiv.className = `${dataDiv.className} clickable`;
                        dataDiv.onclick = () => {
                            window.open(`https://twitter.com/statuses/${rowData['tweetId']}`);
                        }
                    }

                    if (dataItem === 'followerId') {
                        dataDiv.className = `${dataDiv.className} clickable`;
                        dataDiv.onclick = () => {
                            window.open(`https://twitter.com/intent/user?user_id=${rowData[dataItem]}`);
                        }
                    }

                    if (dataItem === 'botName' || dataItem === 'name') {
                        dataDiv.className = `${dataDiv.className} clickable`;
                        dataDiv.onclick = () => {
                            window.location.href = `/bot/${rowData[dataItem]}`;
                        }
                    }

                    rowDiv.appendChild(dataDiv);
                }
            }

            targetDiv.appendChild(rowDiv)
        }


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