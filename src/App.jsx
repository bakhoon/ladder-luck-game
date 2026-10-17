import React, { useState } from 'react';
import Setup from './Setup.jsx';
import Draw from './Draw.jsx';
import Play from './Play.jsx';
import { BUDDIES, randomRungs, shuffledResults } from './ladder.js';

export default function App() {
  const [screen, setScreen] = useState('setup');
  const [n, setN] = useState(5);
  const [busts, setBusts] = useState(2);
  const [names, setNames] = useState(() => BUDDIES.map(() => ''));
  const [rungs, setRungs] = useState([]);
  const [rungsFor, setRungsFor] = useState(0); // player count the rungs were drawn for
  const [results, setResults] = useState([]);
  const [round, setRound] = useState(0);

  // Each player keeps a crayon color; an empty name falls back to that color's name.
  const players = BUDDIES.slice(0, n).map((b, i) => ({ color: b.color, name: names[i].trim() || b.name }));
  const setName = (i, value) => setNames((list) => list.map((v, j) => (j === i ? value : v)));

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
    return <Draw n={n} players={players} rungs={rungs} setRungs={setRungs} onBack={() => setScreen('setup')} onGo={toPlay} />;
  }
  if (screen === 'play') {
    return (
      <Play
        key={round}
        n={n}
        players={players}
        rungs={rungs}
        results={results}
        onRedraw={() => setScreen('draw')}
        onNewGame={() => setScreen('setup')}
      />
    );
  }
  return <Setup n={n} busts={busts} names={names} setN={setN} setBusts={setBusts} setName={setName} onNext={toDraw} />;
}
