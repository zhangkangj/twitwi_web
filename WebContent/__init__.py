from flask import *
import MySQLdb
import json
import math

DEBUG = True
app = Flask(__name__)

@app.before_request
def before_request():
    return

@app.route('/')
def welcome():
    response = make_response(render_template('index.html'))
    response.headers['Cache-Control'] = 'no-cache, must-revalidate'
    return response

@app.route('/test')
def test():
    return make_response(render_template('test.html'))

@app.route('/about')
def about():
    return make_response(render_template('about.html'))

@app.route('/blog')
def blog():
    return make_response(render_template('blog.html'))

@app.route('/contact')
def contact():
    return make_response(render_template('contact.html'))

@app.route('/research')
def research():
    return make_response(render_template('research.html'))

@app.route('/mention.json')
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
        state_dict = result[time]
        if state not in state_dict:
            state_dict[state] = {}
        entity_dict = state_dict[state]
        if entity not in entity_dict:
            entity_dict[entity] = {}
        entity_dict[entity] = count
        row = cursor.fetchone()
    return json.dumps(result)
    
@app.route('/topic.json')
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
    for time in result:
        for entity in result[time]:
            total = 0
            for topic in result[time][entity]:
                total += result[time][entity][topic] 
            for topic in result[time][entity]:
                if result[time][entity][topic] < total * 0.05:
                    result[time][entity][topic] = 0
                else:
                    result[time][entity][topic] = round(result[time][entity][topic] * math.sqrt(1.0 * result[time][entity][topic] / total)) 
                    print round(result[time][entity][topic] * math.sqrt(result[time][entity][topic] / total))
    return json.dumps(result)

@app.route('/tweet.json')
def sample_tweet():
    result = []
    try:
        time = request.args.get('time')
        state = request.args.get('state')
        topic = request.args.get('topic')
        entity = request.args.get('entity')
    except:
        return json.dumps(result)
    if None in [time, topic]:
        return json.dumps(result)
    try:
        g.con = MySQLdb.connect(host = 'twitwi.mit.edu', user = 'team', passwd = 'twitwi', db = 'twitwi', port = 3306)
    except:
        return 'server down'
    cursor = g.con.cursor()
    if state == None:
        if entity == None:
            cursor.execute("""SELECT id,created_at,name,screen_name,text FROM election_sample where created_at >= %s and created_at < %s and topic = %s ORDER BY retweet_count DESC LIMIT 10""" , (time, int(time) + 86400, topic))
        else:
            cursor.execute("""SELECT id,created_at,name,screen_name,text FROM election_sample where created_at >= %s and created_at < %s and topic = %s and entity = %s ORDER BY retweet_count DESC LIMIT 10""" , (time, int(time) + 86400, topic, entity))    
    else:
        if entity == None:
            cursor.execute("""SELECT id,created_at,name,screen_name,text FROM election_sample where created_at >= %s and created_at < %s and state  = %s and topic = %s ORDER BY retweet_count DESC LIMIT 10""" , (time, int(time) + 86400, state, topic))
        else:
            cursor.execute("""SELECT id,created_at,name,screen_name,text FROM election_sample where created_at >= %s and created_at < %s and state  = %s and topic = %s and entity = %s ORDER BY retweet_count DESC LIMIT 10""" , (time, int(time) + 86400, state, topic, entity))
    entry = cursor.fetchone()
    while entry:
        id = str(entry[0])
        name = entry[2].decode("utf-8",errors='ignore') 
        text = entry[4].decode('utf-8',errors='ignore')
        result.append({'id':id,'created_at':entry[1],'name':name, 'screen_name': entry[3], 'text': text})
        entry = cursor.fetchone()
    return json.dumps(result)

if __name__ == '__main__':
    app.run(debug=DEBUG, host = '0.0.0.0', port = 5000)