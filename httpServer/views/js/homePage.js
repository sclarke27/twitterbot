class HomePage extends BasePage {
    constructor(parentDiv) {
        super(parentDiv);

        this.botsList = [];
        this.tweetList = [];
        this.retweetList = [];
        this.favoritesList = [];

        this.botsDiv = null;
        this.tweetsDiv = null;
        this.retweetsDiv = null;
        this.favoritesDiv = null;

    }

    start() {
        console.info('start page');

        this.botsDiv = document.createElement('div');
        this.botsDiv.id = 'botsContainer';
        this.botsDiv.className = 'container';
        this.botsDiv.innerText = 'loading...';
        this.parentDiv.appendChild(this.botsDiv);

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

        this.fetchBotsListData()
            .then((results) => {
                console.info('[home] - bots -', results);
                if (results.data) {
                    this.botsList = results.data;
                    this.refreshList('Bots', this.botsDiv, this.botsList);
                }
            });
        this.fetchTweetListData()
            .then((results) => {
                console.info('[home] - tweets -', results);
                if (results.data) {
                    this.tweetList = results.data;
                    this.refreshList('Tweets', this.tweetsDiv, this.tweetList);
                }
            });
        this.fetchRetweetListData()
            .then((results) => {
                console.info('[home] - retweets - ', results);
                if (results.data) {
                    this.retweetList = results.data;
                    this.refreshList('Retweets', this.retweetsDiv, this.retweetList);
                }
            })
        this.fetchFavoritesListData()
            .then((results) => {
                console.info('[home] - favorites - ', results);
                if (results.data) {
                    this.favoritesList = results.data;
                    this.refreshList('Favorites', this.favoritesDiv, this.favoritesList);
                }
            })


    }

}