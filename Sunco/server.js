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
    let messagePost = new SunshineConversationsApi.MessagePost();
    messagePost.setAuthor({type: 'business'});
    messagePost.setContent({type: 'text', text: 'Olá! Eu sou um Bot!'});
    let response = await apiInstance.postMessage(appId, conversationId, messagePost);
    console.log('API RESPONSE:\n', response);
}

app.listen(8000, () => {
    console.log('App rodando na porta 8000');
});

