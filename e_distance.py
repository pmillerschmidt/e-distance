from collections import defaultdict, deque
from typing import List, Set, Tuple

import nltk
from nltk.corpus import brown, words
from nltk.probability import FreqDist
from collections import Counter
import argparse


def load_dictionary():
    return set(word.lower() for word in words.words() if word.isalpha())


class EditDistanceGame:
    def __init__(self,
                 common_only: bool = False):
        # get dictionary (if common only, use that)
        self.dictionary = brown.words() if common_only else load_dictionary()

    def get_neighbors(self, word):
        neighbors = []
        alphabet = 'abcdefghijklmnopqrstuvwxyz'
        # Adding a letter
        for i in range(len(word) + 1):
            for letter in alphabet:
                new_word = word[:i] + letter + word[i:]
                if new_word in self.dictionary:
                    neighbors.append(new_word)
        # Removing a letter
        for i in range(len(word)):
            new_word = word[:i] + word[i + 1:]
            if new_word in self.dictionary:
                neighbors.append(new_word)
        # Swapping a letter
        for i in range(len(word)):
            for letter in alphabet:
                if letter != word[i]:
                    new_word = word[:i] + letter + word[i + 1:]
                    if new_word in self.dictionary:
                        neighbors.append(new_word)
        return list(set(neighbors))

    def find_path(self, start, end):
        queue = [(start, [start])]
        visited = set()
        while queue:
            (word, path) = queue.pop(0)
            if word not in visited:
                visited.add(word)
                if word == end:
                    return path
                neighbors = self.get_neighbors(word)
                for neighbor in neighbors:
                    if neighbor not in visited:
                        queue.append((neighbor, path + [neighbor]))

        return None

def play_game():
    parser = argparse.ArgumentParser()
    parser.add_argument('--start', type=str, default='he')
    parser.add_argument('--end', type=str, default='here')
    args = parser.parse_args()
    start = args.start
    end = args.end
    game = EditDistanceGame()
    if start not in game.dictionary or end not in game.dictionary:
        print("Both start and end words must be valid dictionary words.")
        return
    # get the optimal path
    path = game.find_path(start, end)
    # return solution if it exists
    if path:
        print(f"Solution found in {len(path) - 1} steps:")
        print(" -> ".join(path))
    else:
        print("No solution found.")


if __name__ == "__main__":
    play_game()