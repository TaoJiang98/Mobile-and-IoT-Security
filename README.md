# RobocallTranscripe

## How to run or software:

Call Transciber:
Useful Link: https://www.twilio.com/blog/live-transcribing-phone-calls-using-twilio-media-streams-and-google-speech-text?utm_source=youtube&utm_medium=video&utm_campaign=project_saiyan&utm_content=transcribe_calls
1. Have Twilio Account (created by Tu)
2. Create your own Google Cloud Account
  - Enable the Google Speech-to-Text API
  - Create a service account
  - Download a private key as JSON
  - modify the .env file to add the path to your private key (eg. GOOGLE_APPLICATION_CREDENTIALS='')
4. Install Ngrok
  - run ngrok using ./ngrok 8082
  - update the url with the https url you just create in part a.
  - twilio phone-numbers:update 8454976912 --voice-url  https://xxxxxxxx.ngrok.io
5. AWS credential has already been put in index.js file
6. npm intall (install all other packages)
7. node index.js (run the js program)

ML Models:

Flask App:

Install all dependencies, they are listed in requirements.txt.

Assuming one places the "newvectorizer.sav" and "decisiontree.sav" files in the same directory as the flask app after creation (we have already inserted them) the flask app should run without issue. This can be done by calling either flask run, or python3 app.py from your terminal in the folder containing the app. The only difference between this version of the app and the one currently running on AWS is that this version runs in debug mode for developer convenience. This will run it on port 5000. The developer version deployed to AWS has this changed to run in deoyment mode on port 8080. We ran it using the command nohup python3 app.py
