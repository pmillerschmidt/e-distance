from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict, deque
from typing import List, Set, Tuple
import nltk
from nltk.corpus import words

app = Flask(__name__)
CORS(app)  # This allows your React app to make requests to this server

# Load the dictionary
nltk.download('words')
dictionary = set(word.lower() for word in words.words() if word.isalpha())

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

@app.route('/api/validate-word', methods=['POST'])
def validate_word():
    data = request.json
    word = data.get('word', '').lower()
    return jsonify({'valid': word in dictionary})

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

if __name__ == '__main__':
    app.run(debug=True)
