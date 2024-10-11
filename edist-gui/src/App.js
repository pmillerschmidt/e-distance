import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

// Import your background image
import backgroundImage from './lily-pad.jpg';

const theme = createTheme({
  palette: {
    primary: { main: '#4caf50' },
    secondary: { main: '#2196f3' },
  },
});

const backgroundStyle = {
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const API_BASE_URL = 'http://127.0.0.1:5000/api';  // Adjust this if your Flask app runs on a different port

const LilyPadGame = () => {
  const [startWord, setStartWord] = useState('');
  const [endWord, setEndWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [remainingGuesses, setRemainingGuesses] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [solution, setSolution] = useState(null);

  useEffect(() => {
    if (gameStarted) {
      fetchRemainingGuesses();
    }
  }, [guesses, gameStarted]);

  const fetchRemainingGuesses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/remaining-guesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_word: startWord,
          end_word: endWord,
          current_word: currentWord,
          guesses: guesses.length
        })
      });
      const data = await response.json();
      setRemainingGuesses(data.remaining_guesses);
    } catch (error) {
      console.error('Error fetching remaining guesses:', error);
      setMessage('Error connecting to the server. Please try again.');
    }
    setIsLoading(false);
  };

  const validateWord = async (word) => {
    try {
      console.log(`Validating word: ${word}`);
      const response = await fetch(`${API_BASE_URL}/validate-word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
        // Remove the credentials: 'include' line
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Validation result for ${word}:`, data);
      return data.valid;
    } catch (error) {
      console.error('Error in validateWord:', error);
      setMessage(`Error validating word: ${error.message}`);
      return false;
    }
  };

  const checkEditDistance = async (word1, word2) => {
    const response = await fetch(`${API_BASE_URL}/check-edit-distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word1, word2 })
    });
    const data = await response.json();
    return data.valid;
  };

  const findPath = async (start, end) => {
    try {
      const response = await fetch(`${API_BASE_URL}/find-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Error in findPath:', error);
      setMessage(`Error finding path: ${error.message}`);
      return null;
    }
  };

  const handleStartGame = async (e) => {
    e.preventDefault();
    if (!startWord || !endWord) {
      setMessage('Please enter both start and end words.');
      return;
    }

    try {
      const [startValid, endValid] = await Promise.all([
        validateWord(startWord),
        validateWord(endWord)
      ]);

      if (!startValid || !endValid) {
        setMessage('Both start and end words must be valid English words.');
        return;
      }

      setCurrentWord(startWord);
      setGuesses([startWord]);
      setGameStarted(true);
      setMessage(`Start from ${startWord} and try to reach ${endWord}`);
      // Find initial path and set distance
      const initialPath = await findPath(startWord, endWord);
      setCurrentDistance(initialPath ? initialPath.length - 1 : null);
    } catch (error) {
      console.error('Error in handleStartGame:', error);
      setMessage(`Error starting game: ${error.message}`);
    }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    if (!guess) {
      setMessage('Please enter a guess.');
      return;
    }

    const [isValidWord, isValidMove] = await Promise.all([
      validateWord(guess),
      checkEditDistance(currentWord, guess)
    ]);

    if (!isValidWord) {
      setMessage('Invalid guess. The word must be a valid English word.');
      return;
    }

    if (!isValidMove) {
      setMessage('Invalid move. The word must be one edit away from the current word.');
      return;
    }

    setCurrentWord(guess);
    setGuesses([...guesses, guess]);

    if (guess.toLowerCase() === endWord.toLowerCase()) {
      setMessage(`Congratulations! You've reached ${endWord}!`);
      setGameWon(true);
      setCurrentDistance(0);
    } else {
      // Find new path and update distance
      const newPath = await findPath(guess, endWord);
      setCurrentDistance(newPath ? newPath.length - 1 : null);
      setMessage(`Valid move! Keep going.`);
    }

    setGuess('');
  };

const handleSolve = async () => {
    const path = await findPath(currentWord, endWord);
    if (path) {
      setSolution(path);
      setMessage("Here's the solution path!");
    } else {
      setMessage("Sorry, couldn't find a solution path.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box style={backgroundStyle}>
        <Container maxWidth="sm">
          <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ padding: 3, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <Typography component="h1" variant="h4" align="center" color="primary" gutterBottom>
              LilyPad
            </Typography>
            {!gameStarted ? (
              <Box component="form" onSubmit={handleStartGame} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Start Word"
                  value={startWord}
                  onChange={(e) => setStartWord(e.target.value.toLowerCase())}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="End Word"
                  value={endWord}
                  onChange={(e) => setEndWord(e.target.value.toLowerCase())}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Start Game
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {`Goal: ${startWord} → ${endWord}`}
                </Typography>
                <Typography variant="body2" align="center" gutterBottom>
                  Change, add, or remove one letter at a time.
                </Typography>
                {currentDistance !== null && (
                  <Typography variant="h6" align="center" color="secondary" gutterBottom>
                    Current Distance: {currentDistance}
                  </Typography>
                )}
                <Box component="form" onSubmit={handleGuess} sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Enter your guess"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.toLowerCase())}
                    margin="normal"
                    required
                    autoFocus
                    disabled={gameWon}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={gameWon}
                  >
                    Make Guess
                  </Button>
                </Box>
                <Button
                  onClick={handleSolve}
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  sx={{ mt: 1, mb: 2 }}
                  disabled={gameWon}
                >
                  Solve
                </Button>
              </>
            )}
            <Typography color="text.secondary" align="center">
              {message}
            </Typography>
            <List>
              {guesses.map((word, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${index + 1}. ${word}`} />
                </ListItem>
              ))}
            </List>
            {solution && (
              <>
                <Typography variant="h6" align="center" color="primary" gutterBottom>
                  Solution Path:
                </Typography>
                <List>
                  {solution.map((word, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${index + 1}. ${word}`} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LilyPadGame;
