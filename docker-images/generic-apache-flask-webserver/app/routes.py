# coding=utf-8

from flask import render_template, flash, redirect, session, url_for, request, g, Markup
from app import app
from lorem.text import TextLorem

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/random_text/')
def random_text():
    # Obtain the min_words and max_words from the URL GET parameters
    min_words = request.args.get('min_words', default='5')
    max_words = request.args.get('max_words', default='10')

    lorem = TextLorem(wsep=' ', srange=(int(min_words),int(max_words)))
    return render_template('random_text.html', random_text=lorem.sentence())

# If 404, use random_text()
@app.errorhandler(404)
def page_not_found(e):
    return random_text()
