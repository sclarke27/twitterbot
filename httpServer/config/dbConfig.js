const DbConfig = {
    enabled: false,
    dbName: 'twitterBot',
    collections: [
        'tweets',
        'retweets',
        'favorites',
        'followers',
        'bots',
        'quotes'
    ]
}

module.exports = DbConfig;