class BotPage extends BasePage {
    constructor(parentDiv, botName) {
        super(parentDiv);

        this.botName = botName;

        this.followersList = [];
        this.tweetList = [];
        this.retweetList = [];
        this.favoritesList = [];

        this.followersDiv = null;
        this.tweetsDiv = null;
        this.retweetsDiv = null;
        this.favoritesDiv = null;

    }

    start() {
        console.info('start page');

        this.followersDiv = document.createElement('div');
        this.followersDiv.id = 'followersContainer';
        this.followersDiv.className = 'container';
        this.followersDiv.innerText = 'loading...';
        this.parentDiv.appendChild(this.followersDiv);

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

        this.fetchBotsFollowersData(this.botName)
            .then((results) => {
                console.info('[home] - followers -', results);
                if (results.data) {
                    this.followersList = results.data;
                    this.refreshList('Followers', this.followersDiv, this.followersList);
                }
            });
        this.fetchTweetListData(this.botName)
            .then((results) => {
                console.info('[home] - tweets -', results);
                if (results.data) {
                    this.tweetList = results.data;
                    this.refreshList('Tweets', this.tweetsDiv, this.tweetList);
                }
            });
        this.fetchRetweetListData(this.botName)
            .then((results) => {
                console.info('[home] - retweets - ', results);
                if (results.data) {
                    this.retweetList = results.data;
                    this.refreshList('Retweets', this.retweetsDiv, this.retweetList);
                }
            })
        this.fetchFavoritesListData(this.botName)
            .then((results) => {
                console.info('[home] - favorites - ', results);
                if (results.data) {
                    this.favoritesList = results.data;
                    this.refreshList('Favorites', this.favoritesDiv, this.favoritesList);
                }
            })


    }

}