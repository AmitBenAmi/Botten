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

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
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
var messageNudger = new nudger();
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('None', (session, args) => {
    session.send(emojis.get('coffee'), session.message.text);
    messageNudger.setNewMessage(session)
})
.matches('Watch', (session, args) => {
    session.send('Hi you motherfucker!!!', session.message.text);
})
.matches('Weather', (session, args) => {

    try{
    // Require the module 
var Forecast = require('forecast');
 
// Initialize 
var forecast = new Forecast({
  service: 'darksky',
  key: 'your-api-key',
  units: 'celcius',
  cache: true,      // Cache API requests 
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
    minutes: 27,
    seconds: 45
  }
});
 
// Retrieve weather information from coordinates (Sydney, Australia) 
forecast.get([-33.8683, 151.2086], function(err, weather) {
  if(err) return console.dir(err);
  console.dir(weather);
});
 
// Retrieve weather information, ignoring the cache 
forecast.get([-33.8683, 151.2086], true, function(err, weather) {
  if(err) return console.dir(err);
  console.dir(weather);
});

    session.send("Weather" + weather, session.message.text);
} 
    catch(ex){  session.send("Weather error" + ex, session.message.text);}
})
.matches('shani', (session, args) => {
    session.send('is the best', session.message.text);
})
.onDefault((session) => {
    //session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.get('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

