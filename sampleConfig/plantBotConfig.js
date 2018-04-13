const PlantBotConfig = {
  enabled: true,
  botName: 'PlantBot',
  consumer_key: '41hNYW9qpaysKSbJllwd1EG55',
  consumer_secret: 'rp4KfQiAGnZfxR2Nobzk5O99ckzQ0YLQtKGIPHD36xUbVPJbPm',
  access_token: '956741331883192320-WdxxJIm1WwTZgemH32dupWutB89YCEk',
  access_token_secret: 'iQXR4hUL2N8BX5nrL2Or8F5HEYyEe5DNEWw7o0zL801fW',
  randomTweet: {
    enabled: false,
    intervalTimeout: 1000 * 120, // in milliseconds
  },
  trackFollowers: {
    enabled: false,
    intervalTimeout: 1000 * 60 * 120, // in milliseconds
  }
}
module.exports = PlantBotConfig;