from GetModelNVec import GetModel, Vectorize

if __name__ == '__main__':
    # Itemisze
    getmodel = GetModel(trainDataPath = '/Users/xinyue/CS 6333 Mobile and IoT Security/Project/fraud_call.file',
                        portion = 0.2,
                        trainEpoch = 10)
    vec = Vectorize(predData = 'SSN')
    # Get model and vectorized predict data
    getmodel.pickModel()
    vec.vectorizeData()
