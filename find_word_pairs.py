import random
import pickle
from create_word_graph import MOST_COMMON_10K


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
    walk_length = 10
    loaded_graph = load_graph()
    # Start with a random word from the graph
    start_word = random.choice(MOST_COMMON_10K)
    # Perform a random walk of length 10, ensuring no word repeats
    word_walk = random_walk(loaded_graph, start_word, walk_length)
    print("Random walk of words:", word_walk)


if __name__ == "__main__":
    main()
