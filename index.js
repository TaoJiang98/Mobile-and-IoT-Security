const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({server});
const VoiceResponse = require('twilio').twiml.VoiceResponse;

//for calling our flask app 
const axios = require("axios")
const url = "http://ec2-50-17-29-203.compute-1.amazonaws.com:8080/predict";

/**Calling AWS DynamoDB */
var AWS = require("aws-sdk");
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": "",
    "secretAccessKey": ""
};

AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();
let insert = function (content, status) {
    var input = {
        "date" : new Date().toISOString(),
        "content": content,
        "status": status
    }
    var params = {
        TableName: "CallContent",
        Item: input
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("database insert error: " + JSON.stringify(err, null, 2));
        } else {
            console.log("database insert: success");
        }
    })
}

require('dotenv').config();

const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const request = {
    config: {
        encoding: "MULAW",
        sampleRateHertz: 8000,
        languageCode: "en-US"
    },
    interimResults: true
};

function helper(contents) {
    var res = "";
    for (let i = 0; i < contents.length - 1; i++) {
        if (contents[i].length > contents[i + 1].length) {
            res += contents[i];
        }
    }
    res += contents[contents.length - 1];
    return res;
}

var contents = [];
const response = new VoiceResponse();

wss.on('connection', (ws) => {
    console.log('New Connection Initiated');
    let recognizeStream = null;
    var currentDate = new Date();

    ws.on("message", async message => {
        const msg = JSON.parse(message);
        switch(msg.event) {
            case "connected":
                console.log(`A new call has connected`);
                contents = [];
                var count = 0;
                recognizeStream = client
                    .streamingRecognize(request)
                    .on("error", console.error)
                    .on("data", data => {
                        const curTrans = data.results[0].alternatives[0].transcript;
                        contents.push(curTrans);
                        console.log(data.results[0].alternatives[0].transcript);

                        if (Math.abs(new Date() - currentDate) / 1000 >= 8 && count == 0) {
                            console.log("The phone call is 8 seconds now");
                            const firstClassify = helper(contents);
                            console.log("The contents speaker said is " + firstClassify);
                            axios.post(url, JSON.stringify({'calltext': firstClassify}))
                                .then (res => {
                                    console.log("The result from classified model is " + res.data);
                                })
                            count += 1;
                        }
                        // if (curTrans.includes("press")) {
                        //     response.say('Hello World');
                        // }
                    });

                break;
            case "start":
                console.log(`Starting Media Stream`);
                break;
            case "media":
                recognizeStream.write(msg.media.payload);
                break;
            case "stop":
                console.log(`Call Has Ended`);
                recognizeStream.destroy();
                // fraud or normal
                var callStatus = "normal";
                // remove duplicate prefix
                //findUnique();                
                //call tha flask app find out what type of call it is
                var element = helper(contents);
                console.log("content is : " + element);
                
                axios.post(url, JSON.stringify({'calltext': element}))
					.then (res => {
						//console.log('status code  ${res.status}');
						console.log(res.data);
                        if (res.data.includes("fraud")) {
                            callStatus = "fraud";
                        }
					})
					.catch(error=>{
						console.error(error);
					});
                //pop stuff into DB
                //insert(lastElement, callStatus);
                break;
        }
    });
});

app.post('/', (req, res) => {
    res.set('Content-Type', "text/xml");
    res.send(
        `<Response>
            <Start>
                <Stream url="wss://${req.headers.host}"/>
            </Start>
            <Say>
                I will stream the next 60 seconds of audio
            </Say>
            <Pause length="60" />
        </Response>`
    );
});

console.log('listening at Port 8080');
server.listen(8080);

 
