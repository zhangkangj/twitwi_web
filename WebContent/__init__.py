from contextlib import closing
from flask import Flask, render_template, redirect, g, jsonify, request, url_for, session, flash
import socket

DEBUG = True
app = Flask(__name__)
app.secret_key = "\xeb5\x97fI\x05\xd813\xa5\xf5\xd4}\x15\xb8Cfo\xd4['\x194\x11"

@app.route('/')
def welcome():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=DEBUG, port = 5000)