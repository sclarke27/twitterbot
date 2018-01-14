const SampleConfig = {
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: '',
  randomRetweet: {
    enabled: true,
    intervalTimeout: 1000 * 60 * 60 * 1.3, // in milliseconds
    queryList: ['#cutepuppy OR #puppiesoftwitter OR #puppy OR #dogsoftwitter OR #cutedogs OR #gooddog OR #goodpuppers OR #doggo filter:images filter:safe'],
    queryParams: {
      resultType: 'latest',
      language: 'en',
      has: 'images',
      count: 100
    }
  },
  randomFavorite: {
    enabled: true,
    intervalTimeout: 1000 * 60 * 60 * 1.5, // in milliseconds
    queryList: ['#cutepuppy OR #puppiesoftwitter OR #puppy OR #dogsoftwitter OR #cutedogs OR #gooddog OR #goodpuppers OR #doggo filter:images filter:safe'],
  },
  randomTweet: {
    enabled: true,
    intervalTimeout: 1000 * 60 * 90, // in milliseconds
  }
}
module.exports = SampleConfig;