'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const SunshineConversationsApi = require('sunshine-conversations-client');

let defaultClient = SunshineConversationsApi.ApiClient.instance;

let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'app_62c755ac5644f300efe2a29f';
basicAuth.password = 'fb8SIeIH_navp-VPTw9itwhRor5xUSsdP4S9AAB_0dOGvtnpWeZtN6iylkpVnJGeL4C4FqEoo6yopMzCxlcrfQ';

const apiInstance = new SunshineConversationsApi.MessagesApi();

const app = express();

app.use(bodyParser.json());

app.post('/message', function(req, res) {
  console.log('webhook PAYLOAD:\n', JSON.stringify(req.body, null, 4));
  const appId = req.body.app.id;
  const trigger = req.body.events[0].type;

  if (trigger === 'conversation:message') {
    const authorType = req.body.events[0].payload.message.author.type;
    if(authorType === 'user'){
        const conversationId = req.body.events[0].payload.conversation.id;
        sendMessage(appId, conversationId);
    }
  }
  res.sendStatus(200);
});

async function sendMessage(appId, conversationId){
  const data = new SunshineConversationsApi.MessagePost();
  data.author = {
    type: 'business',
    displayName: "Botzinho",
    avatarUrl: "https://w1.pngwing.com/pngs/278/853/png-transparent-line-art-nose-chatbot-internet-bot-artificial-intelligence-snout-head-smile-black-and-white.png"
  };
  data.content = {
    type: 'image', 
    mediaUrl: 'http://bieluk-first-project.herokuapp.com/gifs/compiler-bot.gif'
  };
  apiInstance.postMessage(appId, conversationId, data).catch(function (error){ 
    console.log(error) 
  });
}

app.listen(8000, () => {
    console.log('App rodando na porta 8000');
});