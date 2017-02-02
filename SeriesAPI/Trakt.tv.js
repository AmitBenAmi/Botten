var http = require('http');
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
        http.get(`http://imdb.wemakesites.net/api/${ response[0].ids.imdb }?api_key=fa97b5b3-f918-4c2d-af92-9c4d3d6244af`,
                 res => {
                     var body = '';
                     res.on('data', chunk => {
                         body += chunk;                         
                     });

                     res.on('end', () => {
                         var imdbResponse = JSON.parse(body);

                         // Invoking the callback with the data from imdb
                         Callback([{
                            title: response[0].title,
                            image: imdbResponse.data.image
                         }]);
                     });
        });
    });
};

traktMessage.FindPopularMovies = function (Callback) {
    this.FindPopulars(Callback, 'movies');
};

traktMessage.FindPopularShows = function (Callback) {
    this.FindPopulars(Callback, 'shows');
};

traktMessage.searchForItem = function (text, Callback) {
    trakt.search.text({
        query: `${ text }`,
        type: 'movie,show'
    }).then(queryResponse => {
        var item = queryResponse[0].movie || queryResponse[0].show;
        http.get(`http://imdb.wemakesites.net/api/${ item.ids.imdb }?api_key=fa97b5b3-f918-4c2d-af92-9c4d3d6244af`,
                 res => {
                     var body = '';
                     res.on('data', chunk => {
                         body += chunk;                         
                     });

                     res.on('end', () => {
                         var imdbResponse = JSON.parse(body);

                         // Invoking the callback with the data from imdb
                         Callback({
                            title: item.title,
                            image: imdbResponse.data.image
                         });
                     });
        });
    });
};

module.exports = traktMessage;