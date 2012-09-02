from contextlib import closing
from flask import Flask, render_template, redirect, g, jsonify, request, url_for, session, flash
import socket

DEBUG = True
#database configuration
app = Flask(__name__)
app.secret_key = "\xeb5\x97fI\x05\xd813\xa5\xf5\xd4}\x15\xb8Cfo\xd4['\x194\x11"

#handle http requests. methods are self-explanatory    
@app.route('/')
def welcome():
    return render_template('index.html', message = "123", status = "321")

if __name__ == '__main__':
    #sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    #sock.bind(('localhost', 0))
    #port = sock.getsockname()[1]
    #sock.close()
    #app.run(debug=DEBUG, port = port)
    app.run(debug=DEBUG, port = 5000)