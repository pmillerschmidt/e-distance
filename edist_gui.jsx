import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const API_BASE_URL = 'http://localhost:5000/api';

const EDistGUI = () => {
  const [startWord, setStartWord] = useState('');
  const [endWord, setEndWord] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gameStarted) {
      setCurrentWord(startWord);
      setGuesses([startWord]);
    }
  }, [gameStarted, startWord]);

  const handleStartGame = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setGuesses([]);

    if (!startWord || !endWord) {
      setError('Please enter both start and end words.');
      return;
    }

    try {
      const [startValid, endValid] = await Promise.all([
        validateWord(startWord),
        validateWord(endWord)
      ]);

      if (!startValid || !endValid) {
        setError('Both start and end words must be valid English words.');
        return;
      }

      setGameStarted(true);
    } catch (error) {
      setError('An error occurred while validating words. Please try again.');
    }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');

    if (!guess) {
      setError('Please enter a guess.');
      return;
    }

    try {
      const [isValidWord, isOneEditAway] = await Promise.all([
        validateWord(guess),
        checkEditDistance(currentWord, guess)
      ]);

      if (!isValidWord || !isOneEditAway) {
        setError('Invalid guess. The word must be a valid English word and one edit away from the current word.');
        return;
      }

      setGuesses([...guesses, guess]);
      setCurrentWord(guess);
      setGuess('');

      if (guess === endWord) {
        setFeedback(`Congratulations! You've reached the end word in ${guesses.length} steps.`);
        setGameStarted(false);
      } else {
        const path = await findPath(guess, endWord);
        const distanceToEnd = path ? path.length - 1 : 'unknown';
        setFeedback(`Valid guess! Distance to end word: ${distanceToEnd}`);
      }
    } catch (error) {
      setError('An error occurred while processing your guess. Please try again.');
    }
  };

  const validateWord = async (word) => {
    const response = await fetch(`${API_BASE_URL}/validate-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word })
    });
    const data = await response.json();
    return data.valid;
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
    const response = await fetch(`${API_BASE_URL}/find-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start, end })
    });
    const data = await response.json();
    return data.path;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4">Word Transformation Game</h1>
      {!gameStarted ? (
        <form onSubmit={handleStartGame} className="space-y-4">
          <div>
            <label htmlFor="startWord" className="block text-sm font-medium text-gray-700">
              Start Word
            </label>
            <Input
              type="text"
              id="startWord"
              value={startWord}
              onChange={(e) => setStartWord(e.target.value.toLowerCase())}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="endWord" className="block text-sm font-medium text-gray-700">
              End Word
            </label>
            <Input
              type="text"
              id="endWord"
              value={endWord}
              onChange={(e) => setEndWord(e.target.value.toLowerCase())}
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Start Game
          </Button>
        </form>
      ) : (
        <form onSubmit={handleGuess} className="space-y-4">
          <div>
            <label htmlFor="guess" className="block text-sm font-medium text-gray-700">
              Your Guess
            </label>
            <Input
              type="text"
              id="guess"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toLowerCase())}
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Make Guess
          </Button>
        </form>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {feedback && (
        <Alert className="mt-4">
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}

      {guesses.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Your Path:</h2>
          <p className="text-gray-600">
            {guesses.join(' -> ')}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Current steps: {guesses.length - 1}
          </p>
        </div>
      )}
    </div>
  );
};

export default EDistGUI;