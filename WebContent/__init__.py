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
    cursor.execute("""SELECT * FROM election where time = %s """, (time,))
    entry = cursor.fetchone()
    while entry:
        result.append({'state':entry[1],'obama':entry[2],'romney':entry[3]})
        entry = cursor.fetchone()
    return json.dumps({'data':result})

@app.route('/mention')
def mention():
    result = {}
    cursor = g.con.cursor()
    cursor.execute("""SELECT time, state, entity, count FROM election_count WHERE topic = 'mention' ORDER BY time""")
    row = cursor.fetchone()
    while row:
        time = row[0]
        state = row[1]
        entity = row[2]
        count = row[3]
        if time not in result:
            result[time] = {}
        entity_dict = result[time]
        if entity not in entity_dict:
            entity_dict[entity] = {}
        state_dict = entity_dict[entity]
        if state not in state_dict:
            state_dict[state] = {}
        state_dict[state] = count
        row = cursor.fetchone()
    return json.dumps(result)
    
@app.route('/topic')
def topic():
    result = {}
    cursor = g.con.cursor()
    cursor.execute("""SELECT time, topic, entity, count FROM election_count WHERE topic != 'mention' ORDER BY time""")
    row = cursor.fetchone()
    while row:
        time = row[0]
        topic = row[1]
        entity = row[2]
        count = row[3]
        if time not in result:
            result[time] = {}
        entity_dict = result[time]
        if entity not in entity_dict:
            entity_dict[entity] = {}
        topic_dict = entity_dict[entity]
        if topic not in topic_dict:
            topic_dict[topic] = {}
        topic_dict[topic] = count
        row = cursor.fetchone()
    return json.dumps(result)

@app.route('/sample')
def sample_tweet():
    cursor = g.con.cursor()
    cursor.execute("""SELECT * FROM election_tweet limit 10 """)
    entry = cursor.fetchone()
    result = []
    while entry:
        pass
    return 

if __name__ == '__main__':
    app.run(debug=DEBUG, host = '0.0.0.0', port = 5000)
