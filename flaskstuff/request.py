import requests

#url = 'http://ec2-3-91-234-90.compute-1.amazonaws.com:8080/predict'
url = "http://localhost:5000/predict"
r = requests.post(url,{'calltext':"whos mans",})
print(r)
print(r.content)