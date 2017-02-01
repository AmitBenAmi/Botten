var http = require('http');

var options = {
    host: 'https://api.trakt.tv/',
    path: '/',
    method: 'GET'
};

http.header('content-Type', 'application/json');
http.header('trakt-api-key', 'c4ea0f22aee36a9f7a099cc8c2ec078e479a97df19c02b403ce3f3db94a21b38');
http.header('trakt-api-version', 2);

http.request(options, (response) => {
    
});