from flask import *
import MySQLdb
import json

DEBUG = True
app = Flask(__name__)

@app.before_request
def before_request():
    try:
        g.con = MySQLdb.connect(host = '127.0.0.1', user = 'team', passwd = 'twitwi', db = 'twitwi', port = 3306)
        print "connected to db"
    except:
        print 'server down'

@app.route('/')
def welcome():
    return render_template('index.html')

@app.route('/count')
def count():
    try:
        day = request.args.get('day')
    except:
        return 'Error. Wrong arguments.'
    result = []
    cursor = g.con.cursor()
    cursor.execute("""SELECT * FROM election where day = %s """, (day,))
    entry = cursor.fetchone()
    while entry:
        result.append([entry[1],entry[2],entry[3]])
        entry = cursor.fetchone()
    print result
    return json.dumps('data',result)

if __name__ == '__main__':
    app.run(debug=DEBUG, port = 5000)