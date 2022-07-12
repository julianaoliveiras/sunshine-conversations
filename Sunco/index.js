'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const Smooch = require("smooch-core");
var cors = require("cors");
var axios = require("axios");

var SunshineConversationsClient = require("sunshine-conversations-client");

const apiInstance = new SunshineConversationsClient.MessagesApi();
const suncoData = new SunshineConversationsClient.MessagePost();
const apiInstanceSB = new SunshineConversationsClient.SwitchboardActionsApi();
const apiInstanceConversation = new SunshineConversationsClient.ConversationsApi();
 
const acessBotPress = JSON.stringify({
    "email": "joao.melo@viaconsulting.com.br",
    "password": "viadev@botpress#2021"
});

const KEY_ID = "app_62c755ac5644f300efe2a29f";
const SECRET = "fb8SIeIH_navp-VPTw9itwhRor5xUSsdP4S9AAB_0dOGvtnpWeZtN6iylkpVnJGeL4C4FqEoo6yopMzCxlcrfQ";
const appId = "62c733f7b583e800efc8fe95";

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = KEY_ID;
basicAuth.password = SECRET;

const PORT = 8000;

// const smooch = new Smooch({
//     keyId: KEY_ID,
//     secret: SECRET,
//     scope: 'app'
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());
var messagesToClient = [];

function SendMessageToClient(index, length, conversationId){
    suncoData.author = {
        type: 'business',
        displayName: "BOT CPFL",
        avatarUrl: ""
    };
    suncoData.content ={
        type: 'text',
        text: messagesToClient[index],
    };
    apiInstance.postMessage(appId, conversationId, suncoData)
    .then(function(data){
        if(index++ <length){
            SendMessageToClient(index, length, conversationId);
        }
        if(index == length){
            messagesToClient = [];

        }
    }).catch(function (error){
        console.log("Erro ao enviar menssagem!")
    });

    app.post('/message', function (req, res){
        const switchboardIntegrationName = req.body.events[req.body.events.length -1].playload.conversations.activeSwitchboardIntegration.name;

        const result = {
            statusCode: 200,
            body: JSON.stringify({})
        };
        res.sendStatus(200);
        var objEvent = req.body;
        var nomeUser = null;

        console.log(objEvent.events[0].playload)

        if(objEvent.events[0].playload.message.source.type == "web" && switchboardIntegrationName != "ZD" && objEvent.events[0].playload.conversation.activeSwitchboardIntegration.integrationType != "zd:agentWorkspace" && objEvent.events[0].playload.message.author.type == "user"){
            var userId = objEvent.events[0].playload.message.author.userId;
            var conversationId = objEvent.events[0].playload.conversation.id;
            var textUser = objEvent.events[0].playload.message.content.text;
            var imageUser = objEvent.events[0].playload.message.content.mediaUrl;
            var messageId = objEvent.events[0].playload.message.id;
           
            if (objEvent.events[0].playload.message.source.type =="web"){
                nomeUser ="Visitante Web";
            }
            var tokenBotpress = "";
            var config ={
                method: 'post',
                url: 'http://54.205.194.70:3000/POC_CPFL/api/v1/auth/login/basic/default',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: acessBotPress
            };

            axios(config).then(function(response){
                tokenBotpress = response.data.playload.token;
                var data = JSON.stringify({
                    "type": "text",
                    "text": textUser != undefined ? textUser: "image_OK"
                });
                var config ={
                    method: 'post',
                    url: 'http://54.205.194.70:3000/POC_CPFL/api/v1/bots/poc_cpfl_v1_8/converse' + userId,
                    headers: {
                    'Authorization': 'Bearer' + tokenBotpress,
                    'Content-Type': 'application/json'
                    },
                data: data
                };

                axios(config).then(function(response){
                    for (var i = 0; response.data.responses.length>i; i++){
                        console.log(response.data.responses[i].text)

                        if(response.data.responses[i].type == "text" && response.data.responses[i].text.startsWith("Bem vindo ao atendimento CPFL")){
                            var conversationUpdateBody = {
                                "metadata": {
                                    "first_id_message": messageId
                                }
                            };
                            apiInstanceConversation.updateConversation(appId, conversationId, conversationUpdateBody).then(function (data){
                            },function(error){
                                console.error(error);
                            });

                        }
                        if(response.data.responses[i].type == "text" && !response.data.responses[i].text.startsWith("{")){
                            suncoData.author ={
                                type: 'business'
                            };
                            suncoData.content ={
                                type: 'text',
                                text: response.data.responses[i].text,
                            };

                            messagesToClient.push(response[i].text);
                        }
                        else if(response.data.responses[i].type == "text" && !response.data.responses[i].text.startsWith("{")){
                            console.log(response.data.responses[i].text);

                            var answersBot = JSON.parse(response.data.responses[i].text);
                            apiInstanceConversation.getConversation(appId, conversationId).then(function (data){
                                var bodyPassControl={
                                    "switchboardIntegration": "next",
                                    "metadata":{
                                        "dataCapture.ticketField.4412738721819": answersBot.nomeColaborador,
                                        "dataCapture.ticketField.4412746400411": answersBot.nomeSolicitante,
                                        "dataCapture.ticketField.4412738731675": answersBot.nomeDestaqueColaborador,
                                        "dataCapture.ticketField.4412746471963": answersBot.rgColaborador,
                                        "dataCapture.ticketField.4412738745371": answersBot.telefoneSolicitante,
                                        "dataCapture.ticketField.4412738768027": answersBot.areaColaborador,
                                        "dataCapture.ticketField.4412746520603": answersBot.nomeCPFL,
                                        "dataCapture.ticketField.4412746463771": answersBot.matriculaColaborador,
                                        "dataCapture.ticketField.4412746404123": answersBot.matriculaSolicitante,
                                        "dataCapture.systemField.tags": answersBot.motivo + ""+ answersBot.tipoEspera + ""+ answersBot.designacao+""+answersBot.localidade+"",
                                        "first_message_id": data.conversation.metadata.first_id_message
                                    }
                                }
                                if(nomeUser != null){
                                    bodyPassControl.metadata["dataCapture.systemField.requester.name"] = nomeUser                                      
                                }
                                console.log(bodyPassControl);

                                apiInstanceSB.passControl(appId, conversationId, bodyPassControl).then(()=>{
                                    console.log("Passando para o Zendesk")
                                },(error)=>{
                                    console.log("erro no transbordo para o zendesk")
                                    console.log(error)
                                });
                            }, function(error){
                            console.log(error)
                           });

                        }
                        else if(response.data.responses[i].type == "image"){
                            messagesToClient.push("image_OK");
                        }
                    }
                    SendMessageToClient(0, messagesToClient.length, conversationId);
                })
                .catch(function (error){
                    console.error("erro no post botpress converse");
                    console.error(error);
                    result.statusCode = 500
                });
            })
        }

    })

}
app.listen(8000, function (){
    console.log("Server is running");
});