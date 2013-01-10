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

@app.route('/frame')
def frame():
    return render_template('frame.html')
	
@app.route('/ivoted')
def ivoted_page():
	return render_template('ivoted.html')

@app.route('/gun')
def gun_page():
    return make_response(render_template('gun.html')) 	

# the meat
@app.route('/<call>.json')
def ajax(call):
	args = []
	d = None
	if len(request.args) != 0:
		for a in request.args:
			args.append('%s=%s' % (a, request.args[a]))
		arg_string = '&'.join(args)
		d = ul.urlopen('%s/%s.json?%s' % (TWITWI_ROOT, call, arg_string))
	else:
		d = ul.urlopen('%s/%s.json' % (TWITWI_ROOT, call))
	return d.read()
	
if __name__ == '__main__':
    app.run(debug=DEBUG, host = '0.0.0.0', port = 5001)