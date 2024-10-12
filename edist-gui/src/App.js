import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
      rgba(0, 100, 0, 0.2) 25%, 
      rgba(0, 150, 0, 0.2) 25%, 
      rgba(0, 150, 0, 0.2) 50%, 
      rgba(0, 100, 0, 0.2) 50%, 
      rgba(0, 100, 0, 0.2) 75%, 
      rgba(0, 150, 0, 0.2) 75%, 
      rgba(0, 150, 0, 0.2) 100%
    )
  `,
  backgroundSize: '200% 200%',
  animation: `${rippleAnimation} 10s linear infinite`,
  overflow: 'hidden',
}));

const float = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(5px, 5px); }
  50% { transform: translate(0, 10px); }
  75% { transform: translate(-5px, 5px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const LilypadContainer = styled(Box)(({ size }) => ({
  position: 'relative',
  width: size,
  height: size,
  animation: `${float} ${7 + Math.random() * 3}s ease-in-out infinite`,
}));

const LilypadCircle = styled('div')(({ size }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: '#4caf50',
  animation: `${pulse} ${3 + Math.random() * 2}s ease-in-out infinite`,
}));

const LilypadInnerCircle = styled('div')(({ size }) => ({
  position: 'absolute',
  top: size / 6,
  left: size / 6,
  width: size / 3,
  height: size / 3,
  borderRadius: '50%',
  backgroundColor: '#45a049',
  opacity: 0.7,
  animation: `${pulse} ${3 + Math.random() * 2}s ease-in-out infinite`,
}));

const MemoizedGuessPath = React.memo(({ words, onUndoGuess }) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
    }
  }, [words]);

  const lilypadSize = 60;
  const horizontalSpacing = containerSize.width / Math.max(words.length, 2);
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
        {/* Render connection lines first */}
        {words.map((_, index) => {
          if (index === 0) return null;
          const startX = (index - 0.5) * horizontalSpacing;
          const startY = 75 + (((index - 1) % 2) * 30);
          const endX = (index + 0.5) * horizontalSpacing;
          const endY = 75 + ((index % 2) * 30);

          return (
            <path
              key={`line-${index}`}
              d={`M${startX},${startY} Q${(startX + endX) / 2},${(startY + endY) / 2} ${endX},${endY}`}
              fill="none"
              stroke="#45a049"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })}
        {/* Render lilypads */}
        {words.map((word, index) => {
          const x = (index + 0.5) * horizontalSpacing;
          const y = 75 + ((index % 2) * 30);

          return (
            <g
              key={`lilypad-${index}`}
              transform={`translate(${x - lilypadSize / 2}, ${y - lilypadSize / 2})`}
              onClick={() => onUndoGuess(index)}
              style={{ cursor: 'pointer' }}
            >
              <MemoizedLilypad word={word} size={lilypadSize} />
            </g>
          );
        })}
      </svg>
    </Box>
  );
});

const MemoizedLilypad = React.memo(({ word, size }) => {
  const animationDuration = useMemo(() => 3 + Math.random() * 2, []);

  return (
    <g>
      <circle cx={size/2} cy={size/2} r={size/2} fill="#4caf50">
        <animate
          attributeName="r"
          values={`${size/2};${size/2*1.05};${size/2}`}
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
        />
      </circle>
      <circle cx={size/3} cy={size/3} r={size/6} fill="#45a049" opacity="0.7">
        <animate
          attributeName="r"
          values={`${size/6};${size/6*1.05};${size/6}`}
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
        />
      </circle>
      <text x={size/2} y={size/2} textAnchor="middle" fill="white" fontSize={size/4} dy=".3em">
        {word}
      </text>
    </g>
  );
});


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

const MemoizedInfoLilypad = React.memo(({ label, value, size }) => {
  const animationDuration = useMemo(() => ({
    float: 7 + Math.random() * 3,
    pulse: 3 + Math.random() * 2
  }), []);

  return (
    <LilypadContainer size={size} style={{ animationDuration: `${animationDuration.float}s` }}>
      <LilypadCircle size={size} style={{ animationDuration: `${animationDuration.pulse}s` }} />
      <LilypadInnerCircle size={size} style={{ animationDuration: `${animationDuration.pulse}s` }} />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: 'white', fontSize: '0.8rem', textAlign: 'center' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color: 'white', fontSize: '1.2rem', textAlign: 'center', wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </LilypadContainer>
  );
});

const StyledTextField = styled(TextField)({
  '& .MuiInput-underline:before': {
    borderBottomColor: 'rgba(0, 0, 0, 0.42)',
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: 'rgba(0, 0, 0, 0.87)',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#4caf50',
  },
});

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

  const checkEditDistance = useCallback(async (word1, word2) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-edit-distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word1, word2 })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Error in checkEditDistance:', error);
      setMessage(`Error checking edit distance: ${error.message}`);
      return false;
    }
  }, []);

  const findPath = useCallback(async (start, end) => {
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
  }, []);

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


 const handleGuess = useCallback(async (e) => {
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
  }, [guess, currentWord, endWord, remainingGuesses, checkEditDistance, findPath]);


  const handleUndoGuess = useCallback((index) => {
    if (index < guesses.length - 1) {
      const newGuesses = guesses.slice(0, index + 1);
      setGuesses(newGuesses);
      setCurrentWord(newGuesses[newGuesses.length - 1]);
      setRemainingGuesses(prevRemainingGuesses => prevRemainingGuesses + (guesses.length - index - 1));
      setSolution(null);
      setGameWon(false);
    }
  }, [guesses, setGuesses, setCurrentWord, setRemainingGuesses, setSolution, setGameWon]);

    const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleGuess(e);
    }
  }, [handleGuess]);

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

  const memoizedInfoLilypads = useMemo(() => (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      alignItems: 'center',
      mb: 2,
      minHeight: '240px'
    }}>
      <Box sx={{ transform: 'translateY(-20px)' }}>
        <MemoizedInfoLilypad label="Start Word" value={startWord} size={110} />
      </Box>
      <Box sx={{ transform: 'translateY(20px)' }}>
        <MemoizedInfoLilypad label="End Word" value={endWord} size={110} />
      </Box>
      <Box sx={{ transform: 'translateY(-20px)' }}>
        <MemoizedInfoLilypad label="Guesses Left" value={remainingGuesses} size={110} />
      </Box>
      <Box sx={{ transform: 'translateY(20px)' }}>
        <MemoizedInfoLilypad label="Current Distance" value={currentDistance !== null ? currentDistance : '?'} size={110} />
      </Box>
    </Box>
  ), [startWord, endWord, remainingGuesses, currentDistance]);

  const memoizedGuessPath = useMemo(() => (
    <MemoizedGuessPath words={solution || guesses} onUndoGuess={handleUndoGuess} />
  ), [solution, guesses, handleUndoGuess]);

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
                {memoizedInfoLilypads}
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
                  <StyledTextField
                    variant="standard"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.toLowerCase())}
                    onKeyPress={handleKeyPress}
                    inputProps={{
                      maxLength: Math.max(startWord.length, endWord.length) + 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                      }
                    }}
                    placeholder="guess..."
                    disabled={gameWon || remainingGuesses === 0}
                    sx={{
                      width: '40%',
                      '& .MuiInput-underline:before': { borderBottomWidth: '2px' },
                      '& .MuiInput-underline:after': { borderBottomWidth: '2px' },
                      '& input::placeholder': {
                        color: 'rgba(0, 0, 0, 0.4)',
                        opacity: 1,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minHeight: '180px', mb: 2 }}>
                  {memoizedGuessPath}
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
