var Trakt = require('trakt.tv');

var traktMessage = {};

var trakt = new Trakt({
  client_id: 'c4ea0f22aee36a9f7a099cc8c2ec078e479a97df19c02b403ce3f3db94a21b38',
  client_secret: '542165552cecdce67364e0f15f25e2846439f7667739d99bcdef9086f3e0899d',
  redirect_uri: null,   // fallbacks to 'urn:ietf:wg:oauth:2.0:oob' 
  api_url: null         // fallbacks to 'api-v2launch.trakt.tv' 
});

traktMessage.FindPopulars = function (Callback, populars) {
    trakt[populars].popular({
        pagination: false
    }).then(response => {
        Callback(response);
    });
};

traktMessage.FindPopularMovies = function (Callback) {
    this.FindPopulars(Callback, 'movies');
};

traktMessage.FindPopularShows = function (Callback) {
    this.FindPopulars(Callback, 'shows');
};

module.exports = traktMessage;