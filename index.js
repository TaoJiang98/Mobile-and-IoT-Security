const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({server});

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

let map = new Map();

function findUnique() {
    for (const key of map.keys()) {
        if (map.get(key) == 1) {
            console.log("unique key is " + key);
            contentStr += key + ". ";
        }
    }
    console.log("the content is " + contentStr);
}

wss.on('connection', (ws) => {
    console.log('New Connection Initiated');

    let recognizeStream = null;

    ws.on("message", async message => {
        const msg = JSON.parse(message);
        switch(msg.event) {
            case "connected":
                console.log(`A new call has connected`);
                contentStr = "";
                map = new Map();
                recognizeStream = client
                .streamingRecognize(request)
                .on("error", console.error)
                .on("data", data => {
                    const curTrans = data.results[0].alternatives[0].transcript;
                    if (map.has(curTrans)) {
                        map.set(curTrans, map.get(curTrans) + 1);
                    } else {
                        map.set(curTrans, 1);
                    }
                    console.log(data.results[0].alternatives[0].transcript);
                })
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
                findUnique();
                //pop stuff into DB
                insert(contentStr);
                
                //call tha flask app find out what type of call it is
                axios.post(url, JSON.stringify({'calltext': contentstr}))
					.then (res => {
						console.log('status code  ${res.status}')
						console.log(res)
						})
					.catch(error=>{
						console.error(error)
						});
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

console.log('listening at Port 8081');
server.listen(8081);

 
