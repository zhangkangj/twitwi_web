from flask import Flask, render_template, make_response, request, g
import MySQLdb
import json
import math

DEBUG = True
app = Flask(__name__)

news = {1344704400-46800:'R:Paul Ryan as VP Candidate',
        1340902800-46800:'O:Obama-sings-boyfriend video went viral',
        1346346000-46800:'R:Accepts GOP Nomination',
        1346173200-46800:'R:RNC',
        1346778000-46800:'O:DNC',
        1346950800-46800:'O:Accepts Democrat Nomination',
        1347901200-46800:'R:"47%" fundraising video',
        1349283600-46800:'B:1st Presidential Debate',
        1349974800-46800:'B:VP Debate',
        1350406800-46800:'B:2nd Presidential Debate',
        1327428000-46800:'O:State of the Union Address',
        1336582800-46800:'O:Supports Same Sex Marriage',
        1350878400:'B:3rd Presidential Debate',
        1352178000:'O:Won the election'
}

DB_HOST = '128.31.7.93'
DB_PORT = 3306
DB_NAME = 'twitwi'
DB_USER = 'twithinks'
DB_PASS = 'tt2012PE31415'

# TODO ugh... please follow DRY principle
#@app.before_first_request
#def connect_to_db():
#    g.con = MySQLdb.connect(host=DB_HOST, port=DB_PORT, db=DB_NAME, user=DB_USER, passwd=DB_PASS)

#@app.before_request
#def before_request():
#    if not g.con or g.con.closed():


@app.route('/')
def index():
    response = make_response(render_template('index.html'))
    return response

@app.route('/frame')
def frame():
    response = make_response(render_template('frame.html'))
    return response

@app.route('/frame_en')
def frame_en():
    response = make_response(render_template('frame_en.html'))
    return response

@app.route('/test')
def test():
    return 'this is a test'

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/alpha-signup')
def alpha_signup():
    return render_template('alpha-signup.html')

@app.route('/research')
def research():
    return render_template('research.html')

@app.route('/mention.json')
def mention():
    result = {}
    try:
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
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
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
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
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
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

@app.route('/news.json')
def get_news():
    return json.dumps(news)

@app.route('/realtime_tweet.json')
def realtime():
    result = []
    try:
        time = request.args.get('time')
    except:
        return json.dumps(result)
    try:
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
    except:
        return 'server down'
    cursor = g.con.cursor()
    if time == None:
        cursor.execute("""SELECT id,created_at,name,screen_name,text FROM election_realtime ORDER BY created_at DESC LIMIT 6""")
    else:
        cursor.execute("""SELECT id,created_at,name,screen_name,text FROM election_realtime where created_at >= %s ORDER BY created_at DESC LIMIT 6""", (time))
    entry = cursor.fetchone()
    if cursor.rowcount != 6:
        return json.dumps(result) 
    while entry:
        id = str(entry[0])
        name = entry[2].decode("utf-8",errors='ignore') 
        text = entry[4].decode('utf-8',errors='ignore')
        result.append({'id':id,'created_at':entry[1],'name':name, 'screen_name': entry[3], 'text': text})
        entry = cursor.fetchone()
    return json.dumps(result)

@app.route('/ivoted.json')
def ivoted():
    try:
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
    except:
        return 'server down'
    cursor = g.con.cursor()
    cursor.execute("""SELECT state, obama, romney FROM ivoted_count""")
    result = {}
    entry = cursor.fetchone()
    while entry:
        state = entry[0]
        result[state] = [entry[1], entry[2]]
        entry = cursor.fetchone()
    return json.dumps(result)

@app.route('/ivoted_tweet.json')
def ivoted_tweet():
    result = []
    try:
        time = request.args.get('time')
    except:
        return json.dumps(result)
    try:
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
    except:
        return 'server down'
    cursor = g.con.cursor()
    if time == None:
        cursor.execute("""SELECT id,created_at,name,screen_name,text,state,entity FROM ivoted_realtime WHERE !isnull(name) AND !isnull(state) ORDER BY created_at DESC LIMIT 15""")
    else:
        cursor.execute("""SELECT id,created_at,name,screen_name,text,state,entity FROM ivoted_realtime WHERE !isnull(name) AND created_at <= %s and created_at > %s - 60 AND !isnull(state) AND state != 'US' AND lower(text) like '%i voted%' LIMIT 15""", (time, time))
    entry = cursor.fetchone()
    while entry:
        id = str(entry[0])
        name = entry[2].decode("utf-8",errors='ignore') 
        text = entry[4].decode('utf-8',errors='ignore')
        state = entry[5]
        entity = entry[6]
        result.append({'id':id,'created_at':entry[1],'name':name, 'screen_name': entry[3], 'text': text, "state":state, "entity":entity})
        entry = cursor.fetchone()
    return json.dumps(result)

@app.route('/ivoted')
def ivoted_page():
    return make_response(render_template('ivoted.html'))

@app.route('/nba.json')
def nba():
    try:
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
    except:
        return 'server down'
    cursor = g.con.cursor()
    cursor.execute("""SELECT state, east, west FROM nba_count""")
    result = {}
    entry = cursor.fetchone()
    while entry:
        state = entry[0]
        result[state] = [entry[1], entry[2]]
        entry = cursor.fetchone()
    return json.dumps(result)

@app.route('/nba_tweet.json')
def nba_tweet():
    result = []
    try:
        time = request.args.get('time')
    except:
        return json.dumps(result)
    try:
        g.con = MySQLdb.connect(host = DB_HOST, user = 'twithinks', passwd = 'tt2012PE31415', db = 'twitwi', port = 3306)
    except:
        return 'server down'
    cursor = g.con.cursor()
    if time == None:
        cursor.execute("""SELECT id,created_at,name,screen_name,text,state,entity FROM nba_realtime WHERE !isnull(name) AND !isnull(state) ORDER BY created_at DESC LIMIT 15""")
    else:
        cursor.execute("""SELECT id,created_at,name,screen_name,text,state,entity FROM nba_realtime WHERE !isnull(name) AND created_at <= %s and created_at > %s - 60 AND !isnull(state) AND state != 'US' AND lower(text) like '%i voted%' LIMIT 15""", (time, time))
    entry = cursor.fetchone()
    while entry:
        id = str(entry[0])
        name = entry[2].decode("utf-8",errors='ignore') 
        text = entry[4].decode('utf-8',errors='ignore')
        state = entry[5]
        entity = entry[6]
        result.append({'id':id,'created_at':entry[1],'name':name, 'screen_name': entry[3], 'text': text, "state":state, "entity":entity})
        entry = cursor.fetchone()
    return json.dumps(result)

@app.route('/gun')
def gun_page():
    return make_response(render_template('gun.html')) 

@app.route('/allstar')
def allstar_page():
		return render_template('allstar.html')
		
if __name__ == '__main__':
    app.run(debug=DEBUG, host = '0.0.0.0', port = 5000)
