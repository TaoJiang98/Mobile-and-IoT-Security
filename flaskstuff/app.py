import numpy as np
from flask import Flask, request, jsonify, render_template
import pickle
import sys
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)
model = pickle.load(open('logregmodel.sav', 'rb'))
vectorizer = pickle.load(open("vectorizer.sav", "rb"))

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

    #return render_template('index.html', prediction_text='This phone call is $ {}'.format(prediction))
    return ('This phone call is $ {}'.format(prediction))

if __name__ == "__main__":
    app.run(debug=True)