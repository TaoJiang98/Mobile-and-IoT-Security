# Robocall Transcribe

## How to run or software:

## Call Transciber:

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

## ML Models:

### Prerequisite
Install the following python packages:

- numpy
- pandas
- matplotlib
- sklearn
- pandas
- pickle
- imlearn

For running all the performance test, *DecisionTree.py* and *detect.py* is what you need. DecisionTree.py will give you information about how overall accuracy, precision, recall and F1-score the model's like. Since this task needs a binary classifier, detect.py focused on models‘ accuracy for each class, which is "Fruad" and "Normal" in this task. We have the completion that **desicion tree** is the best one for this task. 

Using *main.py* to generate models. It requires path to train data, portion (of split train and test data), and train epoch as parameters to train a model. Setting F1-score as standard to decide whether a model is better than other. Moreover, it will vectorize new data for prediction.

Additionally, note that the Call Classifying Python Notebook is quite out of date, and is solely representative of our inital attempt to create a model. 

## Flask App:

Install all dependencies, they are listed in requirements.txt.

Assuming one places the "newvectorizer.sav" and "decisiontree.sav" files in the same directory as the flask app after creation (we have already inserted them) the flask app should run without issue. This can be done by calling either flask run, or python3 app.py from your terminal in the folder containing the app. The only difference between this version of the app and the one currently running on AWS is that this version runs in debug mode for developer convenience. This will run it on port 5000. The developer version deployed to AWS has this changed to run in deoyment mode on port 8080. We ran it using the command nohup python3 app.py &

The GUI version of the app can be accessed here ec2-50-17-29-203.compute-1.amazonaws.com:8080

## User Study Website

public_html contians all of the code and files running at cs.virginia.edu/~jss5ha which we use to host all of the information about our user study. It will run as is if deployed anywhere. It also has the relevant files one can download from that website.  
