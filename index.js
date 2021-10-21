const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({server});

/**Calling AWS DynamoDB */
var AWS = require("aws-sdk");
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": "AKIATEHMKKUJMLCQ34AS",
    "secretAccessKey": "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"
};

AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();
let insert = function (content) {
    var input = {
        "date" : new Date().toISOString(),
        "content": content
    }
    var params = {
        TableName: "CallContent",
        Item: input
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("insert error: " + JSON.stringify(err, null, 2));
        } else {
            console.log("insert: success");
        }
    })
}

require('dotenv').config();

const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

var contentStr = ""

const request = {
    config: {
        encoding: "MULAW",
        sampleRateHertz: 8000,
        languageCode: "en-US"
    },
    interimResults: true
};

wss.on('connection', (ws) => {
    console.log('New Connection Initiated');

    let recognizeStream = null;

    ws.on("message", message => {
        const msg = JSON.parse(message);
        switch(msg.event) {
            case "connected":
                console.log(`A new call has connected`);
                content = []
                recognizeStream = client
                .streamingRecognize(request)
                .on("error", console.error)
                .on("data", data => {
                    console.log(data.results[0].alternatives[0].transcript);
                    //content.push(data.results[0].alternatives[0].transcript);
                    contentStr += data.results[0].alternatives[0].transcript;
                });
                break;
            case "start":
                console.log(`Starting Media Stream`);
                break;
            case "media":
                //console.log(`Receiving Audio...`);
                recognizeStream.write(msg.media.payload);
                break;
            case "stop":
                console.log(`Call Has Ended`);
                recognizeStream.destroy();
                insert(contentStr);
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

 