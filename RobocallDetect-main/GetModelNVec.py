import pandas as pd
from sklearn import preprocessing
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import confusion_matrix
import pickle

class GetModel:
    def __init__(self, trainDataPath, portion, trainEpoch):
        '''
        trainDataPath: the path of train data
        portion: ratio of train data and test data
        trainEpoch: the amount of epoch we trained for the best model
        '''
        self.trainDataPath = trainDataPath
        self.portion = portion
        self.trainEpoch = trainEpoch

    def getData(self):
        '''
        Get train dataset and binarized them
        Split the dataset into train and test
        '''
        dataset = pd.read_csv(self.trainDataPath, sep='\t', names=['label','content'])
        # Convert text into sparse matrix
        cv = CountVectorizer(max_features = 1500)
        x = cv.fit_transform(dataset['content']).toarray()
        # Encode labels
        le = preprocessing.LabelEncoder()
        le.fit(dataset['label'])
        y_binary = le.transform(dataset['label'])
        # Split dataset into train and test 
        x_train, x_test, y_train, y_test = train_test_split(x, y_binary, test_size = self.portion, random_state = 0)
        return le, x_train, x_test, y_train, y_test

    def pickModel(self):
        '''
        Train random forest for several times
        '''
        _, x_train, x_test, y_train, y_test = self.getData()
        F1_scoreBest = 0
        for epoch in range(self.trainEpoch):
            classifier = DecisionTreeClassifier(criterion = 'entropy', random_state = 0)
            classifier.fit(x_train, y_train)
            y_pred_RF = classifier.predict(x_test)
            cm = confusion_matrix(y_test, y_pred_RF)
            TP = cm[1, 1]
            TN = cm[0, 0]
            FP = cm[1, 0]
            FN = cm[0, 1]
            Precision = TP / (TP + FP)
            Recall = TP / (TP + FN)
            F1_Score = 2 * Precision * Recall / (Precision + Recall)
            # Store the best one classifier
            if F1_Score > F1_scoreBest:
                model = pickle.dump(classifier, open("RandomForest", "wb"))
                F1_scoreBest = F1_Score
            print('train epoch', epoch + 1, 'out of', self.trainEpoch)
            # if F1 score is better than 0.999, we can say it's a good enough model
            if F1_scoreBest > 0.999:
                print('Have got the best model!')
                break
        return model

class Vectorize:
    def __init__(self, predData):
        self.predData = predData

    def vectorizeData(self):
        vectorized = pickle.dump(self.predData, open("vectorizer.sav", "wb"))
        return vectorized
         



                    
