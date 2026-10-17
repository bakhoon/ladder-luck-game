import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BUDDIES, W, trace, pathLength, partialPath } from './ladder.js';
import { Buddy, Header, Lane, LadderSvg, CrayonPath } from './components.jsx';

const SPEED = 150; // board units per second
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // slow start, slow finish

export default function Play({ n, rungs, results, onRedraw, onNewGame }) {
  const buddies = BUDDIES.slice(0, n);
  const colors = buddies.map((b) => b.color);
  const paths = useMemo(() => buddies.map((_, i) => trace(i, n, rungs)), [n, rungs]); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState({}); // start -> true
  const [active, setActive] = useState(null);
  const [dist, setDist] = useState(0);
  const [last, setLast] = useState(null);
  const [all, setAll] = useState(false);
  const raf = useRef(0);
  const size = Math.min(46, Math.floor(W / n - 8));

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const go = (i) => {
    if (active !== null || all || done[i]) return;
    const total = pathLength(paths[i].points);
    const duration = (total / SPEED) * 1000;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setActive(i);
    setDist(0);
    const t0 = performance.now();
    const tick = (now) => {
      const t = reduce ? 1 : Math.min(1, (now - t0) / duration);
      setDist(ease(t) * total);
      if (t < 1) { raf.current = requestAnimationFrame(tick); return; }
      setDone((d) => ({ ...d, [i]: true }));
      setLast(i);
      setActive(null);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const shown = all ? Object.fromEntries(buddies.map((_, i) => [i, true])) : done;
  const whoAt = {};
  Object.keys(shown).forEach((k) => { whoAt[paths[k].end] = Number(k); });
  const finished = Object.keys(shown).length === n;

  let banner = 'Tap a buddy up top to start!';
  let bannerBg = '#FFFFFF';
  if (active !== null) { banner = `${buddies[active].name} is climbing down...`; bannerBg = '#FFF1C9'; }
  else if (all) { banner = 'Results are in! Who got the bust?'; bannerBg = '#FFF1C9'; }
  else if (last !== null) {
    const bust = results[paths[last].end] === 'bust';
    banner = `${buddies[last].name} → ${bust ? 'Bust! So close' : 'Safe! Phew'}`;
    bannerBg = bust ? '#E8E2D8' : '#FFE9A8';
  }

  const live = active !== null ? partialPath(paths[active].points, dist) : null;

  return (
    <main className="app">
      <Header step={3} title="Who's the bust?" right={<span style={{ fontSize: 14 }}><b>{Object.keys(shown).length}</b> / {n} arrived</span>} />
      <div className="banner wax" style={{ backgroundColor: bannerBg }} aria-live="polite">{banner}</div>

      <Lane n={n} height={size + 10}>
        {(i) => (
          <button
            className={`start-btn ${active === i ? 'moving' : ''} ${shown[i] && active !== i ? 'used' : ''}`}
            aria-label={`Send ${buddies[i].name} down the ladder`}
            onClick={() => go(i)}
            disabled={active !== null || !!shown[i]}
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <Buddy color={colors[i]} size={size} />
          </button>
        )}
      </Lane>

      <div className="board" style={{ marginTop: -8 }}>
        <LadderSvg n={n} colors={colors} rungs={rungs} faded label="The ladder">
          {Object.keys(shown).map((k) => (
            <CrayonPath key={k} points={paths[k].points} color={colors[k]} />
          ))}
          {live && (
            <>
              <CrayonPath points={live.points} color={colors[active]} />
              <g transform={`translate(${live.tip.x} ${live.tip.y})`}>
                <circle r="15" fill={colors[active]} stroke="#3A2E26" strokeWidth="2.5" />
                <ellipse cx="-4.5" cy="-1" rx="2.4" ry="3.2" fill="#3A2E26" />
                <ellipse cx="4.5" cy="-1" rx="2.4" ry="3.2" fill="#3A2E26" />
              </g>
            </>
          )}
        </LadderSvg>
      </div>

      <Lane n={n} height={54}>
        {(j) => {
          const who = whoAt[j];
          const w = Math.min(56, W / n - 4);
          if (who === undefined) {
            return <div className="result scribble" style={{ width: w }}><span className="q">?</span></div>;
          }
          const bust = results[j] === 'bust';
          return (
            <div className="result wax pop" style={{ width: w, backgroundColor: bust ? '#C9C0B3' : '#F2C14E' }}>
              <span className="label">{bust ? 'Bust' : 'Safe'}</span>
              <span className="who" style={{ backgroundColor: colors[who] }} />
            </div>
          );
        }}
      </Lane>

      <div className="actions">
        <button className="btn wax" onClick={onRedraw} disabled={active !== null}>Redraw</button>
        {finished ? (
          <button className="btn main orange wax" onClick={onNewGame}>New game</button>
        ) : (
          <button className="btn main red wax" onClick={() => setAll(true)} disabled={active !== null}>Reveal all</button>
        )}
      </div>
    </main>
  );
}
