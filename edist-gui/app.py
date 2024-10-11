import random

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import nltk
from nltk.corpus import words

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000", "supports_credentials": True}})

logging.basicConfig(level=logging.DEBUG)
MAX_GUESSES = 10

# Load the dictionary
nltk.download('words')
dictionary = set(word.lower() for word in words.words() if word.isalpha())
# Get the list of words and convert to lowercase
word_list = [word.lower() for word in words.words() if word.isalpha() and 3 <= len(word) <= 8]
# Create a set for faster lookup
word_set = set(word_list)


def get_neighbors(word):
    neighbors = []
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    # Adding a letter
    for i in range(len(word) + 1):
        for letter in alphabet:
            new_word = word[:i] + letter + word[i:]
            if new_word in dictionary:
                neighbors.append(new_word)
    # Removing a letter
    for i in range(len(word)):
        new_word = word[:i] + word[i + 1:]
        if new_word in dictionary:
            neighbors.append(new_word)
    # Swapping a letter
    for i in range(len(word)):
        for letter in alphabet:
            if letter != word[i]:
                new_word = word[:i] + letter + word[i + 1:]
                if new_word in dictionary:
                    neighbors.append(new_word)
    return list(set(neighbors))

def find_path(start, end):
    queue = [(start, [start])]
    visited = set()
    while queue:
        (word, path) = queue.pop(0)
        if word not in visited:
            visited.add(word)
            if word == end:
                return path
            neighbors = get_neighbors(word)
            for neighbor in neighbors:
                if neighbor not in visited:
                    queue.append((neighbor, path + [neighbor]))
    return None


def get_random_word():
    return random.choice(list(dictionary))

def generate_word_pair():
    while True:
        start_word = random.choice(word_list)
        end_word = random.choice(word_list)
        path = find_path(start_word, end_word)
        if path and 5 <= len(path) <= 8:  # 4 to 7 steps (5 to 8 including start word)
            return start_word, end_word

@app.route('/api/get_start_words', methods=['GET'])
def get_start_words():
    start_word, end_word = generate_word_pair()
    return jsonify({
        'start_word': start_word,
        'end_word': end_word
    })


@app.route('/api/generate-words', methods=['GET'])
def generate_words():
    start_word, end_word = generate_word_pair()
    return jsonify({
        'start_word': start_word,
        'end_word': end_word
    })

@app.route('/api/remaining-guesses', methods=['POST'])
def remaining_guesses():
    data = request.json
    start_word = data['start_word']
    end_word = data['end_word']
    current_word = data['current_word']
    guesses_made = data['guesses']

    # Simple logic: subtract guesses made from max guesses
    remaining = max(0, MAX_GUESSES - guesses_made)

    return jsonify({'remaining_guesses': remaining})


@app.route('/api/validate-word', methods=['POST', 'OPTIONS'])
def validate_word():
    if request.method == 'OPTIONS':
        # Preflight request. Reply successfully:
        response = app.make_default_options_response()
    else:
        app.logger.debug(f"Received request: {request.json}")
        data = request.json
        word = data.get('word', '').lower()
        valid = word in dictionary  # Ensure 'dictionary' is defined
        app.logger.debug(f"Validating word: {word}, Result: {valid}")
        response = jsonify({'valid': valid})

    # Set CORS headers
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response


@app.route('/api/check-edit-distance', methods=['POST'])
def check_edit_distance():
    data = request.json
    word1 = data.get('word1', '').lower()
    word2 = data.get('word2', '').lower()
    return jsonify({'valid': word2 in get_neighbors(word1)})

@app.route('/api/find-path', methods=['POST'])
def api_find_path():
    data = request.json
    start = data.get('start', '').lower()
    end = data.get('end', '').lower()
    path = find_path(start, end)
    return jsonify({'path': path})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


if __name__ == '__main__':
    app.run(debug=True)
