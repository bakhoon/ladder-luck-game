import React, { useState } from 'react';
import Setup from './Setup.jsx';
import Draw from './Draw.jsx';
import Play from './Play.jsx';
import { randomRungs, shuffledResults } from './ladder.js';

export default function App() {
  const [screen, setScreen] = useState('setup');
  const [n, setN] = useState(5);
  const [busts, setBusts] = useState(2);
  const [rungs, setRungs] = useState([]);
  const [rungsFor, setRungsFor] = useState(0); // player count the rungs were drawn for
  const [results, setResults] = useState([]);
  const [round, setRound] = useState(0);

  const toDraw = () => {
    if (rungsFor !== n) { setRungs(randomRungs(n)); setRungsFor(n); }
    setScreen('draw');
    window.scrollTo(0, 0);
  };
  const toPlay = () => {
    setResults(shuffledResults(n, busts));
    setRound((r) => r + 1);
    setScreen('play');
    window.scrollTo(0, 0);
  };

  if (screen === 'draw') {
    return <Draw n={n} rungs={rungs} setRungs={setRungs} onBack={() => setScreen('setup')} onGo={toPlay} />;
  }
  if (screen === 'play') {
    return (
      <Play
        key={round}
        n={n}
        rungs={rungs}
        results={results}
        onRedraw={() => setScreen('draw')}
        onNewGame={() => setScreen('setup')}
      />
    );
  }
  return <Setup n={n} busts={busts} setN={setN} setBusts={setBusts} onNext={toDraw} />;
}
