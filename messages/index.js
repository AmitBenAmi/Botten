/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector({
    appId: null,
  appPassword: null
}) : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';


const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

var emojis = require('node-emoji');
var nudger = require('./nudger');
var trakttv = require('../SeriesAPI/Trakt.tv');
var messageNudger = new nudger();
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('None', (session, args) => {
    session.send(emojis.get('coffee'), session.message.text);
<<<<<<< HEAD
    if (session.message.text.includes("?")) {
         messageNudger.setNewMessage(session,true);
    } else {
        messageNudger.cancelTimer(session);
    }
})
.matches('Watch', (session, args) => {
    session.send(args.Entities[0], session.message.text);
    session.send('amit', session.message.text);
    messageNudger.cancelTimer(session);
=======
    messageNudger.setNewMessage(session);
})
.matches('Watch', (session, args, next) => {
>>>>>>> 2957e469560d54166b4e54a12e6a4e42ec614993
    var moviesCallback = function (movies) {

        var messageBack = 'I can suggest you few very popular movies:\n\n';
        for (var i = 0; i < movies.length / 2; i++) {
            messageBack += (i + 1).toString() + ': ' + movies[i].title + '\n\n';
        }

        session.send(messageBack, session.message.text);
    };

    var showsCallback = function (shows) {

        var messageBack = 'I can suggest you few very popular shows:\n\n';
        for (var i = 0; i < shows.length / 2; i++) {
            messageBack += (i + 1).toString() + ': ' + shows[i].title + '\n\n';
        }

        session.send(messageBack, session.message.text);
    };

    // Checking for Movies entities
    var entity = builder.EntityRecognizer.findEntity(args.entities, 'Movies');

    if (entity) {
        trakttv.FindPopularMovies(moviesCallback);
    }
    else {
        // Checking for Shows entities
        entity = builder.EntityRecognizer.findEntity(args.entities, 'Shows');

        if (entity) {
            trakttv.FindPopularShows(showsCallback);
        }
    }
})
.matches('Weather', (session, args) => {
<<<<<<< HEAD
    messageNudger.cancelTimer(session);
    try{
=======
  try{
>>>>>>> 2957e469560d54166b4e54a12e6a4e42ec614993
    // Require the module 
var Forecast = require('forecast');
 
// Initialize 
var forecast = new Forecast({
  service: 'darksky',
  key: '6deb2af77d2dce8586af8ca9928faadf',
  units: 'celcius',
  cache: true,      // Cache API requests 
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
    minutes: 27,
    seconds: 45
  }
});

// Retrieve weather information from coordinates (Sydney, Australia) 
forecast.get([-33.8683, 151.2086], function(err, weather) {
         session.send(weather.daily.data[0].summary, session.message.text);
});
} 
    catch(ex){session.send("Weather error", session.message.text);}

})
.matches('shani', (session, args) => {
    messageNudger.cancelTimer(session);
    session.send('is the best', session.message.text);
})
.onDefault((session) => {
      session.send('Sorry, I did not understand \'%s\'.', session.message.text);
    //session.send('Sorry, I did not understand \'%s\'.', session.message.text);
    // if (session.message.text.includes("?")) {
    //      messageNudger.setNewMessage(session, true);
    // } else {
    //     messageNudger.cancelTimer(session);
    // }
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}