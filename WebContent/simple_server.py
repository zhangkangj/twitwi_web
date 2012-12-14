from flask import *
import json
import math
import urllib2 as ul

DEBUG = True
TWITWI_ROOT = 'http://twitwi.mit.edu'
app = Flask(__name__)

@app.before_request
def before_request():
    return

@app.route('/')
def index():
    print 
    if "18.111." in request.headers.__str__(): 
        return "This is good"
    return request.headers.__str__()
	
if __name__ == '__main__':
    app.run(debug=DEBUG, host = '0.0.0.0', port = 5000)