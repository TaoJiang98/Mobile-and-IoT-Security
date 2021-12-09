import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn import preprocessing
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import confusion_matrix
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
import pickle

# pickle.dump(classifier, open(modelname, "wb"))
# pickle.dump(vectorizer, open("vectorizer.sav", "wb"))
# model and data biniarize

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


le = preprocessing.LabelEncoder()
le.fit(dataset['label'])
y_binary = le.transform(dataset['label'])


X_train, X_test, y_train, y_test = train_test_split(X, y_binary, test_size = 0.2, random_state = 0)

classifierNB = GaussianNB()
classifierNB.fit(X_train, y_train)
y_pred_NB = classifierNB.predict(X_test)

cm_NB = confusion_matrix(y_test, y_pred_NB) 
TP_NB = cm_NB[1, 1]
TN_NB = cm_NB[0, 0]
FP_NB = cm_NB[1, 0]
FN_NB = cm_NB[0, 1]

Accuracy_NB = (TP_NB + TN_NB) / (TP_NB + TN_NB + FP_NB + FN_NB) 
print('NBAccuracy =', Accuracy_NB)
Precision_NB = TP_NB / (TP_NB + FP_NB)
print('NBPrecision =', Precision_NB)
Recall_NB = TP_NB / (TP_NB + FN_NB)
print('NBRecall =', Recall_NB)
F1_Score_NB = 2 * Precision_NB * Recall_NB / (Precision_NB + Recall_NB) 
print('NBF1 =', F1_Score_NB)

classifierDT = DecisionTreeClassifier(criterion = 'entropy', random_state = 0)
classifierDT.fit(X_train, y_train)
y_pred_DT = classifierDT.predict(X_test)

cm_DT = confusion_matrix(y_test, y_pred_DT)
TP_DT = cm_DT[1, 1]
TN_DT = cm_DT[0, 0]
FP_DT = cm_DT[1, 0]
FN_DT = cm_DT[0, 1]

Accuracy_DT = (TP_DT + TN_DT) / (TP_DT + TN_DT + FP_DT + FN_DT)
print('DTAccuracy =', Accuracy_DT)
Precision_DT = TP_DT / (TP_DT + FP_DT)
print('DTPrecision =', Precision_DT)
Recall_DT = TP_DT / (TP_DT + FN_DT)
print('DTRecall =', Recall_DT)
F1_Score_DT = 2 * Precision_DT * Recall_DT / (Precision_DT + Recall_DT)
print('DTF1 =', F1_Score_DT)


classifierRF = RandomForestClassifier(n_estimators = 300, criterion = 'entropy', random_state = 0)
classifierRF.fit(X_train, y_train)
y_pred_RF = classifierRF.predict(X_test)
cm_RF = confusion_matrix(y_test, y_pred_RF)
TP_RF = cm_RF[1, 1]
TN_RF = cm_RF[0, 0]
FP_RF = cm_RF[1, 0]
FN_RF = cm_RF[0, 1]
Accuracy_RF = (TP_RF + TN_RF) / (TP_RF + TN_RF + FP_RF + FN_RF)
print('RFAccuracy =', Accuracy_RF)
Precision_RF = TP_RF / (TP_RF + FP_RF)
print('RFPrecision =', Precision_RF)
Recall_RF = TP_RF / (TP_RF + FN_RF)
print('RFRecall =', Recall_RF)
F1_Score_RF = 2 * Precision_RF * Recall_RF / (Precision_RF + Recall_RF)
print('RFF1 =', F1_Score_RF)

#can change the file destinations as appropriate. 
#need to get my model into a binary form
pickle.dump(classifierDT, open("../../fraudcallmodeltesting/DecisionTree.sav", "wb"))
pickle.dump(cv, open("../../fraudcallmodeltesting/newvectorizer.sav", "wb"))

Accuracy = [Accuracy_RF, Accuracy_DT, Accuracy_NB]
Methods = ['Random_Forest', 'Decision_Trees', 'Naive_Bayes']
Accuracy_pos = np.arange(len(Methods))
plt.bar(Accuracy_pos, Accuracy)
plt.xticks(Accuracy_pos, Methods)
plt.title('comparing the ACCURACY of each model')
plt.show()

Precision = [Precision_RF, Precision_DT, Precision_NB]
Precision_pos = np.arange(len(Methods))
plt.bar(Precision_pos, Precision)
plt.xticks(Precision_pos, Methods)
plt.title('comparing the PRECISION of each model')
plt.show()

Recall = [Recall_RF, Recall_DT, Recall_NB]
Recall_pos = np.arange(len(Methods))
plt.bar(Recall_pos, Recall)
plt.xticks(Recall_pos, Methods)
plt.title('comparing the RECALL of each model')
plt.show()

F1 = [F1_Score_RF, F1_Score_DT, F1_Score_NB]
F1_pos = np.arange(len(Methods))
plt.bar(F1_pos, F1)
plt.xticks(F1_pos, Methods)
plt.title('comparing the F1SCORE of each model')
plt.show()

