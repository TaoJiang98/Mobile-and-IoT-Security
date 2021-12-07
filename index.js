const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({server});
const {TextToSpeech, PlayKey } = require('./utils');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//for calling our flask app 
const axios = require("axios")
const url = "http://ec2-50-17-29-203.compute-1.amazonaws.com:8080/predict";
/**Calling AWS DynamoDB */
var AWS = require("aws-sdk");
let awsConfig = {
    "region": "",
    "endpoint": "",
    "accessKeyId": "",
    "secretAccessKey": ""
};
var callerNumber = "";

AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

let insert = function (contents, status, probability) {
    var input = {
        "date" : new Date().toISOString(),
        "caller": callerNumber,
        "content": contents.join(),
        "status": status,
        "probability": probability
    }
    var params = {
        TableName: "CallContent",
        Item: input
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("database insert error: " + JSON.stringify(err, null, 2));
        } else {
            console.log("[Database]Insert: success");
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
        languageCode: "en-US",
        speechContexts: [{
            "phrases": ["please press $OOV_CLASS_FULLPHONENUM"],
        }]
    },
    interimResults: false,
};

const recognizeStreamToContents = new Map();

const recogNizeStreamToId = {};
var count = 0;
const handleRecognizeStreamText = async (webSocket, stream, data, connectedTime) => {
    const curTrans = data.results[0].alternatives[0].transcript;
    if (!!recognizeStreamToContents.get(stream)) {
        recognizeStreamToContents.get(stream).push(curTrans);
    }
    console.log(curTrans);

    if (Math.abs(new Date() - connectedTime) / 1000 >= 8 && count == 0) {
	count += 1;
        console.log();
        console.log(`[Pre Classify]`);
        var preContent = recognizeStreamToContents.get(stream);
        axios.post(url, JSON.stringify("calltext=" + preContent.toString()))
        .then (res => {
            console.log(res.data);
        })
        .catch(error=>{
            console.error(error);
        });
    }

    if (curTrans.includes("please press")) {
        // console.log("[handleRecognizeStreamText] phrase 'please press' detected.");
        // console.log("[handleRecognizeStreamText] Current sentence is", curTrans);

        const words = curTrans.split(' ');
        const key = words[words.length - 1];

        const speech = await TextToSpeech('Pressing the key for ' + key);
        const speechData = {
            event: 'media',
            streamSid: recogNizeStreamToId[stream],
            media: {
                payload: speech
            }
        };
        const keyTone = await PlayKey(key);
        const keyToneData = {
            event: 'media',
            streamSid: recogNizeStreamToId[stream],
            media: {
                payload: keyTone,
            }
        };

        webSocket.send(JSON.stringify(speechData), (err) => {
            if (!!err) {
                console.log('Error is', err);
            }
        });
        webSocket.send(JSON.stringify(keyToneData), (err) => {
            if (!!err) {
                console.log('Error is', err);
            }
        });
    }
};


wss.on('connection', (ws) => {
    let recognizeStream = null;

    var connectedTime = new Date();

    ws.on("message", async message => {
        const msg = JSON.parse(message);
        switch(msg.event) {
            case "connected":
                console.log(`[Stream Message] A new call has connected`);
                recognizeStream = client.streamingRecognize(request);
                recognizeStream
                .on("error", console.error)
                .on("data", (data) => handleRecognizeStreamText(ws, recognizeStream, data, connectedTime));
                break;
            case "start":
                console.log(`[Stream Message] Starting Media Stream`);
                recogNizeStreamToId[recognizeStream] = msg.start.streamSid;
                recognizeStreamToContents.set(recognizeStream, []);
                break;
            case "media":
                //console.log('[Stream Message] Streaming media to recognize stream');
                recognizeStream.write(msg.media.payload);
                break;
            case "stop":
                console.log(`[Stream Message] Call Has Ended`);
                recognizeStream.destroy();
                // fraud or normal
                var callStatus = "normal";             
                //call tha flask app find out what type of call it is
                var contents = recognizeStreamToContents.get(recognizeStream);
                var contentsStr = contents.toString();
		console.log();
		//console.log('[TYPE]' + typeof(contents));
                console.log("[Final Classify]" + contentsStr);

		axios.post(url, JSON.stringify("calltext=" + contentsStr)) 
			.then (res => {
			//console.log("[RES]", res)
			var probability = res.data.substring(res.data.indexOf("probability") + 12);
                        console.log("probability is: " + probability);
			console.log('[Result]', res.data);
                        if (res.data.includes("fraud")) {
                            callStatus = "fraud";
                        }
                        //pop stuff into DB
                        insert(contents, callStatus, probability);
					})
					.catch(error=>{
						console.error(error);
					});
                recognizeStreamToContents.delete(recognizeStream);
                break;
        }
    });
});

app.post('/', (req, res) => {
    callerNumber = req.body.Caller;
    res.set('Content-Type', "text/xml");
    res.send(
        `<Response>
            <Say voice="alice">Moshi Moshi</Say>
            <Connect>              
                <Stream url="wss://${req.headers.host}"/>
            </Connect>
        </Response>`
    );
});


console.log('listening at Port 8082');
server.listen(8082);

 
