from flask import *
import MySQLdb
import json

DEBUG = False
app = Flask(__name__)

@app.before_request
def before_request():
    return

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
    try:
        g.con = MySQLdb.connect(host = 'twitwi.mit.edu', user = 'team', passwd = 'twitwi', db = 'twitwi', port = 3306)
    except:
        return 'server down'
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
    try:
        g.con = MySQLdb.connect(host = 'twitwi.mit.edu', user = 'team', passwd = 'twitwi', db = 'twitwi', port = 3306)
    except:
        return 'server down'
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
    try:
        g.con = MySQLdb.connect(host = 'twitwi.mit.edu', user = 'team', passwd = 'twitwi', db = 'twitwi', port = 3306)
    except:
        return 'server down'
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
    result = []
    try:
        time = request.args.get('time')
        state = request.args.get('state')
        topic = request.args.get('topic')
        entity = request.args.get('entity')
    except:
        return json.dumps(result)
    if None in [time, topic, entity]:
        return json.dumps(result)
    try:
        g.con = MySQLdb.connect(host = 'twitwi.mit.edu', user = 'team', passwd = 'twitwi', db = 'twitwi', port = 3306)
    except:
        return 'server down'
    cursor = g.con.cursor()
    if state == None:
        cursor.execute("""SELECT id,created_at,user_id,screen_name,text,retweet_count FROM election_sample where created_at >= %s and created_at < %s and topic = %s and entity = %s ORDER BY retweet_count LIMIT 100""" , (time, int(time) + 86400, topic, entity))    
    else:
        cursor.execute("""SELECT id,created_at,user_id,screen_name,text,retweet_count FROM election_sample where created_at >= %s and created_at < %s and state  = %s and topic = %s and entity = %s ORDER BY retweet_count LIMIT 100""" , (time, int(time) + 86400, state, topic, entity))
    entry = cursor.fetchone()
    while entry:
        result.append({'id':entry[0],'created_at':entry[1],'user_id':entry[2], 'screen_name': entry[3], 'text': entry[4], 'retweet_count': entry[5]})
        entry = cursor.fetchone()
    return json.dumps(result)

if __name__ == '__main__':
    app.run(debug=DEBUG, host = '0.0.0.0', port = 5000)
