const DbConfig = {
    enabled: true,
    dbName: 'twitterBot',
    collections: [
        'tweets',
        'retweets',
        'favorites',
        'followers',
        'bots'
    ]
}

module.exports = DbConfig;