import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from scipy.sparse import data
from sklearn import preprocessing
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import confusion_matrix
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
import logging
from sklearn.neural_network import MLPClassifier


logging.basicConfig(filename="SMOTEdt-n.log", level=logging.INFO)
#change this to reflect the path to your dataset
dataset = pd.read_csv("/Users/xinyue/CS 6333 Mobile and IoT Security/Project/fraud_call.file",
                    sep='\t',names=['label','content'])
# Normal: 5287; Fraud: 638 Total: 5925
#     label                                            content
# 0   fraud  hello, i m bank manager of SBI, ur debit card ...
# 1   fraud  Todays Vodafone numbers ending with 4882 are s...
# 2  normal               Please don't say like that. Hi hi hi
# 3  normal                                         Thank you!
# 4  normal  Oh that was a forwarded message. I thought you...

cv = CountVectorizer(max_features = 1500)
X = cv.fit_transform(dataset['content']).toarray()

X = preprocessing.normalize(X, norm='l2', axis=1, copy=True, return_norm=False)

le = preprocessing.LabelEncoder()
le.fit(dataset['label'])
y_binary = le.transform(dataset['label'])

allFraud = dataset[dataset["label"] == 'fraud']
allFraud = cv.fit_transform(allFraud['content']).toarray()
allNormal = dataset[dataset["label"] == 'normal']
allNormal = cv.fit_transform(allNormal['content']).toarray()

sampleStrat = 0.1
sampleStratList = []
fraudAcc = []
normalAcc = []
Acc = []
while sampleStrat < 0.95:
    sampleStrat += 0.05
    sampleStratList.append(sampleStrat)
    logging.info('Float = {0}'.format(sampleStrat))
    print('Float =', sampleStrat)
    sm = SMOTE(sampling_strategy=sampleStrat)
    X_res, y_res = sm.fit_resample(X, y_binary)

    X_train, X_test, y_train, y_test = train_test_split(X_res, y_res, test_size = 0.2, random_state = 0)

    #classifierDT = LogisticRegression(penalty='l2', fit_intercept=True, C=1)
    classifierDT = DecisionTreeClassifier(criterion = 'entropy', random_state = 0)
    # classifierDT = RandomForestClassifier(n_estimators = 300, criterion = 'entropy', random_state = 0)
    # classifierDT = MLPClassifier(solver='lbfgs', alpha=1e-5, hidden_layer_sizes=(128,64), random_state=1)
    classifierDT.fit(X_train, y_train)

    countFraud, countNormal = 0, 0
    y_pred_Fraud = classifierDT.predict(allFraud)
    y_pred_Normal = classifierDT.predict(allNormal)
    for i in y_pred_Fraud:
        if i == 0:
            countFraud += 1
    fraudAcc.append(countFraud/638)
    logging.info('Fraud acc is {0}'.format(countFraud/638))
    print('Fraud acc is', countFraud/638)

    for j in y_pred_Normal:
        if j == 1:
            countNormal += 1
    normalAcc.append(countNormal/5287)
    logging.info('Normal acc is {0}'.format(countNormal/5287))
    print('Normal acc is', countNormal/5287)

    Acc.append((countNormal+countFraud)/5925)
    logging.info('Accuracy in all is {0}'.format((countNormal+countFraud)/5925))
    print('Accuracy in all is', (countNormal+countFraud)/5925)

plt.figure()
plt.xlabel('Float')
plt.ylabel('Accuracy')
plt.plot(sampleStratList, fraudAcc, 'r', label = "Fraud Accuracy")
plt.plot(sampleStratList, normalAcc, 'b', label = "Normal Accuracy")
plt.plot(sampleStratList, Acc, 'g', label = "Over all Accuracy")
plt.ylim(0, 1)
plt.legend()
plt.show()

