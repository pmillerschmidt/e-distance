import React, { useState, useEffect, useRef } from 'react';
import {
 ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';


// Import your background image
import backgroundImage from './lily-pad.jpg';

// Import a cursive font (you may need to adjust the import based on your project setup)
import '@fontsource/dancing-script';

const theme = createTheme({
  palette: {
    primary: { main: '#4caf50' },
    secondary: { main: '#2196f3' },
  },
});

const API_BASE_URL = 'http://127.0.0.1:5000/api';  // Adjust this if your Flask app runs on a different port

const LilypadButton = styled(Button)(({ theme }) => ({
  borderRadius: '50%',
  width: '80px',
  height: '80px',
  padding: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'radial-gradient(circle at 30% 30%, #4caf50 60%, #45a049 100%)',
  color: 'white',
  textTransform: 'none',
  fontSize: '14px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
  },
  '&:hover': {
    background: 'radial-gradient(circle at 30% 30%, #45a049 60%, #4caf50 100%)',
  },
  '&:disabled': {
    background: 'radial-gradient(circle at 30% 30%, #a5d6a7 60%, #81c784 100%)',
  },
}));


const Lilypad = ({ word, subtext, size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="#4caf50" />
    <circle cx="35" cy="35" r="10" fill="#45a049" opacity="0.7" />
    <text x="50" y="45" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
      {word}
    </text>
    {subtext && (
      <text x="50" y="65" textAnchor="middle" fill="white" fontSize="12">
        {subtext}
      </text>
    )}
  </svg>
);


const rippleAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const AnimatedBackground = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  background: `
    linear-gradient(45deg, 
      rgba(0, 100, 0, 0.1) 25%, 
      rgba(0, 150, 0, 0.1) 25%, 
      rgba(0, 150, 0, 0.1) 50%, 
      rgba(0, 100, 0, 0.1) 50%, 
      rgba(0, 100, 0, 0.1) 75%, 
      rgba(0, 150, 0, 0.1) 75%, 
      rgba(0, 150, 0, 0.1) 100%
    )
  `,
  backgroundSize: '200% 200%',
  animation: `${rippleAnimation} 10s linear infinite`,
  overflow: 'hidden',
}));

const Frog = ({ x, y, isJumping }) => (
  <g transform={`translate(${x}, ${y})`}>
    <animateTransform
      attributeName="transform"
      type="translate"
      from={`${x} ${y}`}
      to={`${x} ${y-20}`}
      dur="0.5s"
      begin={isJumping ? "0s" : "indefinite"}
      repeatCount="1"
      fill="freeze"
    />
    <animateTransform
      attributeName="transform"
      type="translate"
      from={`${x} ${y-20}`}
      to={`${x} ${y}`}
      dur="0.5s"
      begin={isJumping ? "0.5s" : "indefinite"}
      repeatCount="1"
      fill="freeze"
    />
    <circle cx="0" cy="0" r="10" fill="#4CAF50" />
    <circle cx="-3" cy="-2" r="2" fill="white" />
    <circle cx="3" cy="-2" r="2" fill="white" />
    <circle cx="-3" cy="-2" r="1" fill="black" />
    <circle cx="3" cy="-2" r="1" fill="black" />
  </g>
);

const GuessPath = ({ words, onUndoGuess }) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [frogPosition, setFrogPosition] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    }
  }, [words]);

  useEffect(() => {
    if (words.length > 1) {
      const newX = ((words.length - 1) / (words.length)) * containerSize.width;
      const newY = 75 + (((words.length - 1) % 2) * 30); // Zig-zag effect
      setFrogPosition({ x: newX, y: newY });
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 1000); // Reset jumping after animation
    }
  }, [words, containerSize]);

  const lilypadSize = 60;
  const horizontalSpacing = containerSize.width / (words.length + 1);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: 150,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg width="100%" height="100%">
        {words.map((word, index) => {
          const x = (index + 1) * horizontalSpacing;
          const y = 75 + ((index % 2) * 30); // Zig-zag effect

          return (
            <g key={index}>
              {index > 0 && (
                <path
                  d={`M${(index) * horizontalSpacing},${75 + (((index - 1) % 2) * 30)} Q${(index + 0.5) * horizontalSpacing},${75 + ((index % 2) * 30)} ${x},${y}`}
                  fill="none"
                  stroke="#45a049"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
              <g
                transform={`translate(${x - lilypadSize / 2}, ${y - lilypadSize / 2})`}
                onClick={() => onUndoGuess(index)}
                style={{ cursor: 'pointer' }}
              >
                <Lilypad word={word} size={lilypadSize} />
              </g>
            </g>
          );
        })}
        <Frog x={frogPosition.x} y={frogPosition.y} isJumping={isJumping} />
      </svg>
    </Box>
  );
};

const LargeLilypad = ({ onClick }) => (
  <svg width="300" height="300" viewBox="0 0 300 300" onClick={onClick} style={{ cursor: 'pointer' }}>
    <circle cx="150" cy="150" r="145" fill="#4caf50" />
    <circle cx="100" cy="100" r="30" fill="#45a049" opacity="0.7" />
    <circle cx="200" cy="80" r="20" fill="#45a049" opacity="0.7" />
    <circle cx="80" cy="200" r="25" fill="#45a049" opacity="0.7" />
    <text x="150" y="130" textAnchor="middle" fill="white" fontSize="48" fontWeight="bold" fontFamily="'Dancing Script', cursive">
      LilyPad
    </text>
    <text x="150" y="200" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
      Play
    </text>
  </svg>
);

const LilyPadGame = () => {
  const [startWord, setStartWord] = useState('');
  const [endWord, setEndWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [remainingGuesses, setRemainingGuesses] = useState(10);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);


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

 const handleStartGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_start_words`);
      const data = await response.json();
      setStartWord(data.start_word);
      setEndWord(data.end_word);
      setCurrentWord(data.start_word);
      setGuesses([data.start_word]);
      setGameStarted(true);
      setGameWon(false);
      setRemainingGuesses(10);
      setSolution(null);
      const initialPath = await findPath(data.start_word, data.end_word);
      setCurrentDistance(initialPath ? initialPath.length - 1 : null);
    } catch (error) {
      setMessage('Error starting the game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    if (!guess) {
      setMessage('Please enter a guess.');
      return;
    }

    const isValidWord = await validateWord(guess);

    if (!isValidWord) {
      setMessage('Not a word')
      return;
    }

    const isValidMove = await checkEditDistance(currentWord, guess);

    if (!isValidMove) {
      setMessage('Not one step away');
      return;
    }

    setCurrentWord(guess);
    setGuesses(prevGuesses => [...prevGuesses, guess]);
    setSolution(null);
    setRemainingGuesses(prevGuesses => prevGuesses - 1);

    if (guess.toLowerCase() === endWord.toLowerCase()) {
      setMessage(`Congratulations! You've reached ${endWord}!`);
      setGameWon(true);
      setCurrentDistance(0);
    } else {
      const newPath = await findPath(guess, endWord);
      setCurrentDistance(newPath ? newPath.length - 1 : null);
      setMessage(`Valid move! Keep going.`);
    }

    if (remainingGuesses <= 1 && guess.toLowerCase() !== endWord.toLowerCase()) {
      setMessage("Game over! You've run out of guesses.");
      setGameWon(true);  // This will disable further guesses
    }
  };

  const handleUndoGuess = (index) => {
    if (index < guesses.length - 1) {
      const newGuesses = guesses.slice(0, index + 1);
      setGuesses(newGuesses);
      setCurrentWord(newGuesses[newGuesses.length - 1]);
      setRemainingGuesses(prevGuesses => prevGuesses + (guesses.length - index - 1));
      setSolution(null);
      setGameWon(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGuess(e);
    }
  };

  const handleSolve = async () => {
    const path = await findPath(currentWord, endWord);
    if (path) {
      setSolution(path);
      setMessage("Here's the solution path!");
      setGameWon(true);
    } else {
      setMessage("Sorry, couldn't find a solution path.");
    }
  };

  const handleRulesOpen = () => {
    setRulesOpen(true);
  };

  const handleRulesClose = () => {
    setRulesOpen(false);
  };



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: 2,
        }}
      >
        {!gameStarted ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <LargeLilypad onClick={handleStartGame} />
            {isLoading && <CircularProgress sx={{ mt: 2, color: 'white' }} />}
          </Box>
        ) : (
          <Paper
            elevation={5}
            sx={{
              width: '100%',
              maxWidth: 'md',
              height: '96vh',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <AnimatedBackground>
              <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 2,
              }}>
                <Typography component="h1" variant="h3" align="center" color="primary" sx={{ fontFamily: '"Dancing Script", cursive', fontWeight: 700, mb: 2 }}>
                  LilyPad
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mb: 2 }}>
                    <Lilypad word={startWord} size={80} />
                    <Frog size={50} />
                    <Lilypad word={endWord} size={80} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mb: 2 }}>
                    <Lilypad word={remainingGuesses} subtext="Guesses Left" size={80} />
                    <Lilypad word={currentDistance !== null ? currentDistance : '?'} subtext="Distance" size={80} />
                  </Box>
                  <Box component="form" onSubmit={handleGuess} sx={{ width: '100%', mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Enter your guess"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value.toLowerCase())}
                      onKeyPress={handleKeyPress}
                      margin="normal"
                      required
                      autoFocus
                      disabled={gameWon || remainingGuesses === 0}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minHeight: '150px', mb: 2 }}>
                    <GuessPath words={solution || guesses} onUndoGuess={handleUndoGuess} />
                  </Box>
                  <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
                    {message}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    width: '100%',
                  }}>
                    <LilypadButton onClick={handleSolve} disabled={gameWon}>
                      Solve
                    </LilypadButton>
                    <LilypadButton onClick={handleRulesOpen}>
                      Rules
                    </LilypadButton>
                    <LilypadButton onClick={() => setGameStarted(false)}>
                      New Game
                    </LilypadButton>
                  </Box>
                </Box>
              </Box>
            </AnimatedBackground>
          </Paper>
        )}
      </Box>
      <Dialog open={rulesOpen} onClose={handleRulesClose}>
        <DialogTitle>Game Rules</DialogTitle>
        <DialogContent>
          <Typography>
            Change, add, or remove one letter at a time to transform the start word into the end word.
            You have a limited number of guesses to reach the end word.
            Click on a previous guess to undo moves.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRulesClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default LilyPadGame;
