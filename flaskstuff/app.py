import numpy as np
from flask import Flask, request, jsonify, render_template
import pickle
import sys
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)
model = pickle.load(open('DecisionTree.sav', 'rb'))
vectorizer = pickle.load(open("newvectorizer.sav", "rb"))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict',methods=['POST'])
def predict():
    '''
    For rendering results on HTML GUI
    '''
    int_features = [str(x) for x in request.form.values()]
    print("this is some stuff ", int_features, file=sys.stdout)
    int_features = vectorizer.transform(int_features) #should only be the one value
    #final_features = [np.array(int_features)] #dont need this one
    prediction = model.predict(int_features)
    prob = model.predict_proba(int_features)
    prob = prob.tolist()
    print("pred type is ", type(prediction))
    print(prediction)
    print("prob type is ", type(prob))
    print(prob)
    prediction = int (prediction[0])
    print("pred type is now ", type(prediction))
    if prediction == 1:
        print("here")
        prediction = "normal"
        prob = prob[0][1]
    else:
        print("here")
        prediction = "fraud"
        prob=prob[0][0]
    #i scp'ed this !!!
    #return render_template('index.html', prediction_text='This phone call is $ {}'.format(prediction))
    print(prob)
    return ('This phone call is ' + prediction + " with probability " + str(prob))

if __name__ == "__main__":
    #this is changed to run at localhost 8080 for AWS
    app.run(debug=True)
