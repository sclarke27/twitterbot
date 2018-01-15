const DbConfig = {
    enabled: true,
    dbName: 'twitterBot',
    collections: [
        'tweets',
        'retweets',
        'favorites',
        'followers'
    ]
}

module.exports = DbConfig;