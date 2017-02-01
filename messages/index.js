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
var Forecast = require('forecast');


// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('None', (session, args) => {
    session.send(emojis.get('coffee'), session.message.text);
    if (session.message.text.includes("?")) {
         messageNudger.setNewMessage(session,true);
    } else {
        messageNudger.cancelTimer(session);
    }

    for (var i = 0; i < args.entities.length; i++) {
        session.send((i + 1).toString() + ') ' + args.entities[i].entity + ', ' + args.entities[i].type + '\n\n', session.message.text);
    }

    for (var i = 0; i < session.message.entities.length; i++) {
        session.send((i + 1).toString() + ') ' + session.message.entities[i].entity + ', ' + session.message.entities[i].type + '\n\n', session.message.text);
    }
})
.matches('Watch', (session, args) => {
    messageNudger.cancelTimer(session);
    var moviesCallback = function (movies) {

        var messageBack = 'When you have some free time you should go see \';
        for (var i = 0; i < movies.length; i++) {
            messageBack += movies[i].title + '\'. It\'s a real great movie..\n\n';
            messageBack += movies[i].image;
        }

        session.send(messageBack, session.message.text);
    };

    var showsCallback = function (shows) {

        var messageBack = 'I\'ve heard about a real good show called \'';
        for (var i = 0; i < shows.length; i++) {
            messageBack += shows[i].title + '\'.\n\n';
            messageBack += shows[i].image;
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
    messageNudger.cancelTimer(session);
    try{

 
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

forecast.get([32.055614, 34.858787], function(err, weather) {
         session.send("currently weather " + "at timezone " + weather.timezone +" is:" + weather.daily.data[0].summary , session.message.text);
});
} 
    catch(ex){session.send("Weather error", session.message.text);}

})
.matches('surf', (session, args) => {
    messageNudger.cancelTimer(session);
    var user =  session.message.address.user.name
    session.send(`${ user } you asked about surfing ! you should know surf is the best sport ever!`, session.message.text);
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