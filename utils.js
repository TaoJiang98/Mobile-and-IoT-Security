// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');
const wavefile = require('wavefile');

// Import other required libraries
const fs = require('fs');
const util = require('util');

const DTMF_PATH = './dialdtmf_wav_long/';
const dtmfKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'pound', 'star'];
const dtmf = {}

for (let key of dtmfKeys) {
    dtmf[key] = fs.readFileSync(`${DTMF_PATH}${key}.wav`);
}

// Creates a client
const client = new textToSpeech.TextToSpeechClient();
const TextToSpeech = async (text) => {
    // Construct the request
    const request = {
        input: {text: text},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'LINEAR16'},
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;
    const wav = new wavefile.WaveFile(audioContent)
    return EncodeWav(wav);
};

const PlayKey = async (key) => {
    if (!dtmf[key]) {
        return await TextToSpeech('Number not supported');
    }
    const wav = new wavefile.WaveFile(dtmf[key]);
    wav.toSampleRate(8000);
    wav.toMuLaw();
    const buffer = Buffer.from(wav.data.samples).toString('base64');
    return buffer;
};

const PlayAudio = () => {
    const wav = new wavefile.WaveFile(dtmf['1']);
    // fs.writeFileSync('output1.wav', wav.toBuffer());
    // return EncodeWav(wav);
    wav.toSampleRate(3000);
    wav.toMuLaw();
    const buffer = Buffer.from(wav.data.samples).toString('base64');
    return buffer;
}

const EncodeWav = (wav) => {
    wav.toBitDepth('8');
    wav.toSampleRate(8000);
    wav.toMuLaw();
    return Buffer.from(wav.data.samples).toString('base64');
};

module.exports = { TextToSpeech , EncodeWav, PlayKey, PlayAudio };
