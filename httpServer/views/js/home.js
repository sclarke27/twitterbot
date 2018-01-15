class HomePage {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;
        this.tweetList = [];
        this.retweetList = [];
        this.favoritesList = [];

        this.tweetsDiv = null;
        this.retweetsDiv = null;
        this.favoritesDiv = null;

    }

    start() {
        console.info('start page');

        this.tweetsDiv = document.createElement('div');
        this.tweetsDiv.id = 'tweetsContainer';
        this.tweetsDiv.className = 'container';
        this.tweetsDiv.innerText = 'loading...';
        this.parentDiv.appendChild(this.tweetsDiv);

        this.retweetsDiv = document.createElement('div');
        this.retweetsDiv.id = 'retweetsContainer';
        this.retweetsDiv.className = 'container';
        this.retweetsDiv.innerText = 'loading...';
        this.parentDiv.appendChild(this.retweetsDiv);

        this.favoritesDiv = document.createElement('div');
        this.favoritesDiv.id = 'favoritesContainer';
        this.favoritesDiv.className = 'container';
        this.favoritesDiv.innerText = 'loading...';
        this.parentDiv.appendChild(this.favoritesDiv);

        this.fetchTweetListData()
            .then((results) => {
                console.info('[home] - tweets -', results);
                if (results.data) {
                    this.tweetList = results.data;
                    this.refreshList(this.tweetsDiv, this.tweetList);
                }
            });
        this.fetchRetweetListData()
            .then((results) => {
                console.info('[home] - retweets - ', results);
                if (results.data) {
                    this.retweetList = results.data;
                    this.refreshList(this.retweetsDiv, this.retweetList);
                }
            })
        this.fetchFavoritesListData()
            .then((results) => {
                console.info('[home] - favorites - ', results);
                if (results.data) {
                    this.favoritesList = results.data;
                    this.refreshList(this.favoritesDiv, this.favoritesList);
                }
            })


    }

    refreshAllLists() {
        this.refreshList(this.tweetsDiv, this.tweetList);
        this.refreshList(this.refreshList, this.retweetList);
        this.refreshList(this.favoritesDiv, this.favoritesList);
    }

    refreshList(targetDiv, dataList) {
        targetDiv.innerText = "";

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
            if (rowData['tweetId']) {
                rowDiv.onclick = () => {
                    window.open(`https://twitter.com/planetepics/status/${rowData['tweetId']}`);
                }
            }
            for (const dataItem in rowData) {
                if (dataItem !== 'serverError' && dataItem !== 'serverResponse' && dataItem !== '_id') {
                    const dataDiv = document.createElement('div');
                    if (dataItem === 'timestamp') {
                        dataDiv.innerText = moment(rowData[dataItem]).fromNow();
                    } else {
                        dataDiv.innerText = rowData[dataItem];
                    }
                    dataDiv.className = "dataItem";
                    if (dataItem === 'hadError') {
                        dataDiv.style.backgroundColor = (rowData[dataItem] === false) ? 'green' : 'red';
                    }
                    rowDiv.appendChild(dataDiv);
                }
            }

            targetDiv.appendChild(rowDiv)
        }


    }

    fetchTweetListData() {
        return fetch(`/listTweets`, {
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

    fetchRetweetListData() {
        return fetch(`/listRetweets`, {
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

    fetchFavoritesListData() {
        return fetch(`/listFavorites`, {
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