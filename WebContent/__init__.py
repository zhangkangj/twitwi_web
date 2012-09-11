from flask import *
import MySQLdb
import json

DEBUG = True
app = Flask(__name__)

@app.before_request
def before_request():
    try:
        g.con = MySQLdb.connect(host = 'twitwi.mit.edu', user = 'team', passwd = 'twitwi', db = 'twitwi', port = 3306)
        print "connected to db"
    except:
        print 'server down'

@app.route('/')
def welcome():
    response = make_response(render_template('index.html'))
    response.headers['Cache-Control'] = 'no-cache, must-revalidate'
    return response

@app.route('/count')
def count():
    try:
        time = request.args.get('time')
    except:
        return json.dumps('data',[])
    result = []
    cursor = g.con.cursor()
    cursor.execute("""SELECT * FROM election where day = %s """, (time,))
    entry = cursor.fetchone()
    while entry:
        result.append({'state':entry[1],'obama':entry[2],'romney':entry[3]})
        entry = cursor.fetchone()
    return json.dumps({'data':result})

if __name__ == '__main__':
    app.run(debug=DEBUG, host = '0.0.0.0', port = 5000)
