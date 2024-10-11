import networkx as nx
import matplotlib.pyplot as plt
import Levenshtein
from wordfreq import top_n_list
import pickle


# Get the top 10k most common words
MOST_COMMON_10K= [word for word in top_n_list('en', 10000) if len(word) > 2]


# Helper function to get words that are one edit distance away
def get_one_edit_distance_words(word, word_set):
    one_edit_words = set()
    # Iterate through each word in the set
    for w in word_set:
        # Calculate the edit distance
        if Levenshtein.distance(word, w) == 1:
            one_edit_words.add(w)
    return list(one_edit_words)


# Function to create the graph of words
def create_word_graph(word_set):
    G = nx.Graph()
    # Add nodes (words)
    G.add_nodes_from(word_set)
    # Add edges (words that are one edit distance apart)
    for word in word_set:
        neighbors = get_one_edit_distance_words(word, word_set)
        for neighbor in neighbors:
            if not G.has_edge(word, neighbor):  # Avoid duplicate edges
                G.add_edge(word, neighbor)
    return G


# Save the graph to a file
def save_graph(graph, filename="word_graph.pkl"):
    with open(filename, 'wb') as f:
        pickle.dump(graph, f)
    print(f"Graph saved to {filename}")


# Load the graph from a file
def load_graph(filename="word_graph.pkl"):
    with open(filename, 'rb') as f:
        graph = pickle.load(f)
    print(f"Graph loaded from {filename}")
    return graph


# Main code to generate the graph, perform a random walk, and save the graph
def main():
    # Get the top 10k most common words that are at least 3 letters long
    top_words = MOST_COMMON_10K
    # Convert the top words to a set for faster lookups
    top_words_set = set(top_words)
    # # Create the graph of words with one-edit distance edges
    word_graph = create_word_graph(top_words_set)
    # # Save the graph to a file
    save_graph(word_graph, "word_graph.pkl")
    # Load the graph from the file (optional, if needed later)
    loaded_graph = load_graph("word_graph.pkl")
    # Visualize the graph (optional, can be large)
    plt.figure(figsize=(10, 10))
    nx.draw(loaded_graph, node_size=10, node_color='blue', with_labels=False, alpha=0.6)
    plt.title("Graph of Top 10k Words (One Edit Distance)")
    plt.show()


# Run the main function
main()

