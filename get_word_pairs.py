import csv
import random
import pickle
import Levenshtein

from typing import List, Tuple

from wordfreq import top_n_list

MOST_COMMON_10K= [word for word in top_n_list('en', 10000) if len(word) > 2]


# Load the graph from a file
def load_graph(filename="word_graph.pkl"):
    with open(filename, 'rb') as f:
        graph = pickle.load(f)
    print(f"Graph loaded from {filename}")
    return graph


# Function to perform a random walk on the graph, ensuring no repeats
def random_walk(graph, start_word, walk_length):
    walk = [start_word]
    current_word = start_word
    visited_words = set(walk)  # Track visited words
    for _ in range(walk_length - 1):
        neighbors = list(graph.neighbors(current_word))
        # Filter neighbors to exclude already visited words
        neighbors = [w for w in neighbors if w not in visited_words]
        if not neighbors:
            break  # Stop if no unvisited neighbors are available
        current_word = random.choice(neighbors)
        walk.append(current_word)
        visited_words.add(current_word)  # Mark this word as visited
    return walk

def main():
    walks: List[Tuple[str, str]] = []
    n = 25
    walk_length_range = (5, 8)
    loaded_graph = load_graph()
    for _ in range(n):
        walk_length = random.randint(*walk_length_range)
        walk = []
        while len(walk) < walk_length:
            start_word = random.choice(MOST_COMMON_10K)
            walk = random_walk(loaded_graph, start_word, walk_length)
            # ensure the length of the walk is actually the walk length
            edit_distance = Levenshtein.distance(walk[0], walk[-1])
            if edit_distance < walk_length - 1:
                walk = []
        print(walk)
        walks.append((walk[0], walk[-1]))
    # save
    with open('edist-gui/paths.csv', 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(walks)

if __name__ == "__main__":
    main()