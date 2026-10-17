import React from 'react';
import { BUDDIES, MAX_PLAYERS } from './ladder.js';
import { Buddy, Header, Arrow, PlusMinus } from './components.jsx';

function Stepper({ value, min, max, onChange, noun, plusColor }) {
  return (
    <div className="stepper">
      <button className="round-btn wax" aria-label={`Remove a ${noun}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <PlusMinus />
      </button>
      <output aria-live="polite">{value}</output>
      <button className="round-btn wax" style={{ backgroundColor: plusColor }} aria-label={`Add a ${noun}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <PlusMinus plus />
      </button>
    </div>
  );
}

export default function Setup({ n, busts, names, setN, setBusts, setName, onNext }) {
  const order = Array.from({ length: n }, (_, i) => (i < busts ? 'bust' : 'safe'));
  return (
    <main className="app">
      <Header step={1} title="Ladder Game" big />
      <svg width="214" height="14" viewBox="0 0 214 14" aria-hidden="true" style={{ marginTop: -6 }}>
        <path d="M4 9 C 30 2, 50 14, 80 7 S 130 3, 160 9 S 196 5, 208 8" fill="none" stroke="#E4572E" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
      </svg>
      <p className="lead">Pick how many players, write everyone's name, then pick how many busts.</p>

      <section className="card">
        <div className="card-head">
          <h2>Players</h2>
          <Stepper
            value={n}
            min={2}
            max={MAX_PLAYERS}
            noun="player"
            plusColor="#F29E4C"
            onChange={(v) => { setN(v); if (busts > v - 1) setBusts(v - 1); }}
          />
        </div>
        <div className="names">
          {BUDDIES.slice(0, n).map((b, i) => (
            <label key={b.color} className="name-row">
              <Buddy color={b.color} size={30} />
              <span className="sr-only">Name for player {i + 1}</span>
              <input
                type="text"
                value={names[i]}
                placeholder={b.name}
                maxLength={10}
                autoComplete="off"
                enterKeyHint="next"
                onChange={(e) => setName(i, e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="card alt">
        <div className="card-head">
          <h2>Busts</h2>
          <Stepper value={busts} min={1} max={n - 1} noun="bust" plusColor="#A8A096" onChange={setBusts} />
        </div>
        <div className="row-wrap" style={{ gap: 6 }}>
          {order.map((r, i) =>
            r === 'bust' ? (
              <span key={i} className="chip bust wax">X</span>
            ) : (
              <span key={i} className="chip safe wax" role="img" aria-label="Safe">
                <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="7.5" fill="none" stroke="#3A2E26" strokeWidth="3" /></svg>
              </span>
            )
          )}
        </div>
        <p className="note"><b>{n - busts}</b> safe, <b>{busts}</b> bust. They get secretly shuffled under the ladder.</p>
      </section>

      <div className="actions">
        <button className="btn main orange wax" onClick={onNext}>Go draw the ladder <Arrow /></button>
      </div>
    </main>
  );
}
