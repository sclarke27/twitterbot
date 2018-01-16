const twit = require('twit');
const Utils = require('../modules/utils');

class TwitterBot {

    constructor(botConfig, db, showDebug = false) {
        this.showDebug = showDebug;
        this.config = botConfig;
        this.twitterApi = null;
        this.db = db;

        // placeholders for future setIntervals
        this.tweetInterval = null;
        this.retweetInterval = null;
        this.favoriteInterval = null;

        this.retweetQueryString = '';
        this.favoriteQueryString = '';

        if (this.showDebug) {
            console.info(`[TwitterBot] constructed`);
        }


    }

    start() {
        if (this.config.enabled) {
            if (this.showDebug) {
                console.info(`[TwitterBot] start`);
            }

            // initialize twitter api with config info
            this.twitterApi = new twit(this.config);

            // setup random retweet interval if timeout is defined in config and enabled
            if (this.config.randomRetweet && this.config.randomRetweet.intervalTimeout && this.config.randomRetweet.enabled) {
                if (this.showDebug) {
                    console.info(`[TwitterBot] create random retweet interval`);
                }
                this.randomRetweet();
                this.retweetInterval = setInterval(this.randomRetweet.bind(this), this.config.randomRetweet.intervalTimeout);
            }

            // setup random favorite interval if timeout is defined in config and enabled
            if (this.config.randomFavorite && this.config.randomFavorite.intervalTimeout && this.config.randomFavorite.enabled) {
                if (this.showDebug) {
                    console.info(`[TwitterBot] create random favorite interval`);
                }
                this.randomFavorite();
                this.favoriteInterval = setInterval(this.randomFavorite.bind(this), this.config.randomFavorite.intervalTimeout);
            }

            // setup random tweet interval if timeout is defined in config and enabled
            if (this.config.randomTweet && this.config.randomTweet.intervalTimeout && this.config.randomTweet.enabled) {
                if (this.showDebug) {
                    console.info(`[TwitterBot] create random tweet interval`);
                }
                this.randomTweet();
                this.favoriteInterval = setInterval(this.randomTweet.bind(this), this.config.randomTweet.intervalTimeout);
            }

            // setup random tweet interval if timeout is defined in config and enabled
            if (this.config.trackFollowers && this.config.trackFollowers.intervalTimeout && this.config.trackFollowers.enabled) {
                if (this.showDebug) {
                    console.info(`[TwitterBot] create track followers interval`);
                }
                this.trackFollowers();
                this.followersInterval = setInterval(this.trackFollowers.bind(this), this.config.trackFollowers.intervalTimeout);
            }
        }

    }

    end() {
        if (this.showDebug) {
            console.info(`[TwitterBot] end`);
        }

        if (this.favoriteInterval !== null) {
            clearInterval(this.favoriteInterval);
        }

        if (this.retweetInterval !== null) {
            clearInterval(this.retweetInterval);
        }
    }

    trackFollowers() {
        if (!this.config.enabled) {
            return false;
        }
        if (this.showDebug) {
            console.info(`[TwitterBot] trackFollowers`);
        }

        this.getCurrentFollowers();
    }

    getCurrentFollowers() {
        if (!this.config.enabled) {
            return false;
        }
        if (this.showDebug) {
            console.info(`[TwitterBot] getCurrentFollowers`);
        }
        this.twitterApi.get('followers/ids', {}, (err, response) => {
            // log to DB
            const currTimestamp = new Date();
            for (const followerId of response.ids) {
                this.twitterApi.get('users/lookup', {
                        user_id: followerId.toString()
                    },
                    (err, response) => {
                        const follower = response[0];
                        if (err) {
                            // console.info(err.message, followerId);
                        }

                        if (this.db && follower) {
                            this.db.followers.findAndModify({
                                query: {
                                    followerId: follower.id_str
                                },
                                update: {
                                    botName: this.config.botName,
                                    lastUpdate: currTimestamp,
                                    followerUsername: follower.screen_name,
                                    followerId: follower.id_str,
                                    followerAdded: follower.created_at,
                                    tweetCount: follower.statuses_count,
                                    favoriteCount: follower.favourites_count,
                                    followerCount: follower.followers_count,
                                    listedCount: follower.listed_count,
                                    friendsCount: follower.friends_count,
                                    retweetCount: follower.retweet_count,
                                    verified: follower.verified,
                                    rawData: follower
                                },
                                new: true,
                                upsert: true
                            }, (err, doc, lastErr) => {
                                // console.info(err, doc, lastErr);
                                if (err) {
                                    console.error('[main]', err);
                                }
                            })
                        }

                        if (err) {
                            // this.twitterApi.get('followers/list', {
                            //         user_id: followerId.toString()
                            //     },
                            //     (err, response) => {
                            //         console.info('erz', response);
                            //     });
                            // this.db.followers.findAndModify({
                            //     query: {
                            //         followerId: follower.id_str
                            //     },
                            //     update: {
                            //         botName: this.config.botName,
                            //         lastUpdate: currTimestamp,
                            //         followerUsername: 'NOT',
                            //         followerId: follower.id_str,
                            //         followerAdded: follower.created_at,
                            //         tweetCount: follower.statuses_count,
                            //         favoriteCount: follower.favourites_count,
                            //         followerCount: follower.followers_count,
                            //         listedCount: follower.listed_count,
                            //         friendsCount: follower.friends_count,
                            //         retweetCount: follower.retweet_count,
                            //         verified: follower.verified,
                            //         rawData: follower
                            //     },
                            //     new: true,
                            //     upsert: true
                            // }, (err, doc, lastErr) => {
                            //     // console.info(err, doc, lastErr);
                            //     if (err) {
                            //         console.error('[main]', err);
                            //     }
                            // })
                        }

                    })
            }



            if (response) {
                console.info(`[TwitterBot] followers loaded:`);
            }
            // if there was an error while tweeting
            if (err) {
                console.log(`[TwitterBot] error getting followers: ${err.message}`);
            }
        });
    }

    tweet(message) {
        if (!this.config.enabled) {
            return false;
        }
        if (this.showDebug) {
            console.info(`[TwitterBot] tweet`, message);
        }

        // tweet message
        this.twitterApi.post('statuses/update', {
            status: message
        }, (err, response) => {
            // log to DB
            if (this.db) {
                this.db.tweets.insert({
                    timestamp: new Date(),
                    botName: this.config.botName,
                    tweetId: response.id_str,
                    hadError: (err) ? true : false,
                    serverResponse: response,
                    serverError: err
                })
            }

            if (response) {
                console.info(`[TwitterBot] message sent:`);
            }
            // if there was an error while tweeting
            if (err) {
                console.log(`[TwitterBot] error sending message: ${err.message}`);
            }
        });
    }

    retweet(messageId) {
        if (!this.config.enabled) {
            return false;
        }

        if (!messageId) {
            if (this.showDebug) {
                console.error(`[TwitterBot] retweet error: invalid message ID ${messageId}`);
            }
            return false;
        }
        if (this.showDebug) {
            console.info(`[TwitterBot] retweet ${messageId}`);
        }


        this.twitterApi.post('statuses/retweet/:id', {
            id: messageId
        }, (err, response) => {
            // log results to DB
            if (this.db) {
                this.db.retweets.insert({
                    timestamp: new Date(),
                    botName: this.config.botName,
                    tweetId: messageId,
                    hadError: (err) ? true : false,
                    serverResponse: response,
                    serverError: err
                })
            }

            // if response then retweet was successful
            if (response && !err) {
                if (this.showDebug) {
                    console.info(`[TwitterBot] retweet successful ${messageId}`);
                }
            }
            // if there was an error, handle it
            if (err) {
                console.error(`[TwitterBot] retweet error : ${err.message}`);
            }
        });

    }

    favorite(messageId) {
        if (!this.config.enabled) {
            return false;
        }

        if (this.showDebug) {
            console.info(`[TwitterBot] favorite ${messageId}`);
        }

        this.twitterApi.post('favorites/create', {
            id: messageId
        }, (err, response) => {
            // log results to DB
            if (this.db) {
                this.db.favorites.insert({
                    timestamp: new Date(),
                    botName: this.config.botName,
                    tweetId: messageId,
                    hadError: (err) ? true : false,
                    serverResponse: response,
                    serverError: err
                })
            }

            // if there was an error while 'favorite'
            if (err) {
                console.info(`[TwitterBot] error adding favorite id:${messageId} msg:${err.message}`);
            } else {
                console.info(`[TwitterBot] add favorite success:${messageId}`);
            }
        });

    }

    randomTweet() {
        if (!this.config.enabled) {
            return false;
        }

        if (this.showDebug) {
            console.info(`[TwitterBot] randomTweet`);
        }

    }

    randomRetweet() {
        if (!this.config.enabled) {
            return false;
        }

        if (this.showDebug) {
            console.info(`[TwitterBot] randomRetweet`);
        }

        // if we dont have a query string yet, get one
        if (!this.retweetQueryString) {
            this.retweetQueryString = Utils.randomFromArray(this.config.randomRetweet.queryList);
        }

        if (this.showDebug) {
            console.info(`[TwitterBot] query ${this.retweetQueryString}`);
        }

        // setup our search parameters
        const configParams = this.config.randomRetweet.queryParams || {};
        const searchQueryParams = {
            q: this.retweetQueryString,
            result_type: configParams.resultType || 'latest',
            lang: configParams.language || 'en',
            has: configParams.has || 'images',
            count: configParams.count || 100,
        }

        // find a tweet and retweet it
        this.searchTweets(searchQueryParams, (tweetList) => {
            const randomTweet = Utils.randomFromArray(tweetList); // pick a random tweet
            const retweetId = randomTweet.id_str; // grab ID of tweet to retweet

            if (this.showDebug) {
                console.info(`[TwitterBot] selected message ${retweetId} to retweet`);
            }

            this.retweet(retweetId);
        });

    }

    randomFavorite() {
        if (!this.config.enabled) {
            return false;
        }

        if (this.showDebug) {
            console.info(`[TwitterBot] randomFavorite`);
        }

        // if we dont have a query string yet, get one
        if (!this.favoriteQueryString) {
            this.favoriteQueryString = Utils.randomFromArray(this.config.randomFavorite.queryList);
        }

        if (this.showDebug) {
            console.info(`[TwitterBot] query ${this.favoriteQueryString}`);
        }

        // setup our search parameters
        const configParams = this.config.randomFavorite.queryParams || {};
        const searchQueryParams = {
            q: this.favoriteQueryString,
            result_type: configParams.resultType || 'latest',
            lang: configParams.language || 'en',
            has: configParams.has || 'images',
            count: configParams.count || 10,
        }

        // find a tweet and favorite it
        this.searchTweets(searchQueryParams, (tweetList) => {
            const randomTweet = Utils.randomFromArray(tweetList); // pick a random tweet
            const tweetId = randomTweet.id_str; // grab ID of tweet

            if (this.showDebug) {
                console.info(`[TwitterBot] selected message ${tweetId} to favorite`);
            }

            this.favorite(tweetId);
        });

    }

    searchTweets(searchQueryParams, onSuccess, onError) {
        // make sure we have the minimum to handle a search
        if (!searchQueryParams || !onSuccess) {
            console.error(`[TwitterBot] searchQueryParams and onSuccess required`);
            return false;
        }

        // find a tweet
        this.twitterApi.get('search/tweets', searchQueryParams, (err, data) => {
            if (!err && data && data.statuses) {
                // return list of tweets that match search
                onSuccess(data.statuses);

            } else {
                if (onError) {
                    onError(err);
                }
                console.error(`[TwitterBot] Search error ${error.message}`);
            }
        });
    }
}

module.exports = TwitterBot;