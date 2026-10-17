import React, { useRef, useState } from 'react';
import { BUDDIES, PENS, W, H, colX, nearest, snapDistance, clash, clampY, randomRungs } from './ladder.js';
import { Buddy, Header, Arrow, Lane, LadderSvg } from './components.jsx';

const DEFAULT_HINT = 'Drag from one line to the next. Wobbly is OK! Tap a rung to erase it.';

export default function Draw({ n, rungs, setRungs, onBack, onGo }) {
  const [pen, setPen] = useState(PENS[5].color);
  const [msg, setMsg] = useState('');
  const [drag, setDrag] = useState(null);
  const svgRef = useRef(null);
  const colors = BUDDIES.slice(0, n).map((b) => b.color);
  const snap = snapDistance(n);
  const buddySize = Math.min(42, Math.floor((W / n) - 8));

  const toBoard = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) * W) / rect.width, y: ((e.clientY - rect.top) * H) / rect.height };
  };

  const down = (e) => {
    const p = toBoard(e);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not supported */ }
    setDrag({ x0: p.x, y0: p.y, x: p.x, y: p.y });
  };
  const move = (e) => {
    if (!drag) return;
    const p = toBoard(e);
    setDrag((d) => d && { ...d, x: p.x, y: p.y });
  };
  const up = () => {
    const d = drag;
    if (!d) return;
    setDrag(null);
    if (Math.hypot(d.x - d.x0, d.y - d.y0) < 10) {
      const hit = rungs.find((r) => {
        const x1 = colX(r.a, n), x2 = colX(r.a + 1, n);
        if (d.x < x1 - 4 || d.x > x2 + 4) return false;
        const yy = r.y1 + ((r.y2 - r.y1) * (d.x - x1)) / (x2 - x1);
        return Math.abs(yy - d.y) < 16;
      });
      if (hit) { setRungs(rungs.filter((r) => r !== hit)); setMsg('Swish, erased!'); }
      return;
    }
    const s = nearest(d.x0, n), t = nearest(d.x, n);
    if (s.d > snap || t.d > snap || Math.abs(s.c - t.c) !== 1) {
      setMsg('Drag all the way to the line right next to it!');
      return;
    }
    const a = Math.min(s.c, t.c);
    const fromLeft = s.c === a;
    const r = { id: `${Date.now()}`, a, y1: clampY(fromLeft ? d.y0 : d.y), y2: clampY(fromLeft ? d.y : d.y0), color: pen };
    if (clash(r, rungs)) { setMsg('Too close to (or crossing) another rung. Give it some space.'); return; }
    setRungs([...rungs, r]);
    setMsg('');
  };

  let live = null;
  if (drag && Math.hypot(drag.x - drag.x0, drag.y - drag.y0) >= 10) {
    const s = nearest(drag.x0, n), t = nearest(drag.x, n);
    const ok = s.d <= snap && t.d <= snap && Math.abs(s.c - t.c) === 1;
    const tipX = t.d <= snap ? colX(t.c, n) : drag.x;
    live = (
      <g pointerEvents="none">
        <line x1={drag.x0} y1={drag.y0} x2={drag.x} y2={drag.y} stroke={pen} strokeWidth="7.5" strokeLinecap="round" opacity={ok ? 0.95 : 0.45} filter="url(#crayon)" />
        <circle cx={tipX} cy={drag.y} r="10" fill="none" stroke={ok ? '#3A2E26' : 'rgba(58,46,38,.3)'} strokeWidth="2.5" strokeDasharray="4 3" />
      </g>
    );
  }

  return (
    <main className="app">
      <Header step={2} title="Let's Draw!" right={<span style={{ fontSize: 14 }}><b>{rungs.length}</b> rungs</span>} />
      <p className="hint" aria-live="polite">{msg || DEFAULT_HINT}</p>

      <div className="pens" role="radiogroup" aria-label="Crayon color">
        {PENS.map((p) => (
          <button
            key={p.color}
            className={`pen ${pen === p.color ? 'on' : ''}`}
            role="radio"
            aria-checked={pen === p.color}
            aria-label={`${p.name} crayon`}
            onClick={() => { setPen(p.color); setMsg(`${p.name} crayon ready!`); }}
          >
            <span className="stick">
              <span className="tip wax" style={{ backgroundColor: p.color }} />
              <span className="body wax" style={{ backgroundColor: p.color }}><span className="band" /></span>
            </span>
          </button>
        ))}
      </div>

      <Lane n={n} height={buddySize + 8}>
        {(i) => <div style={{ paddingTop: 4 }}><Buddy color={colors[i]} size={buddySize} /></div>}
      </Lane>

      <div
        className="board drawing"
        style={{ marginTop: -8 }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setDrag(null)}
      >
        <LadderSvg n={n} colors={colors} rungs={rungs} svgRef={svgRef} label="Ladder drawing board. Drag from one line to the next to draw a rung.">
          {live}
        </LadderSvg>
      </div>

      <Lane n={n} height={46}>
        {() => (
          <div className="result scribble" style={{ width: Math.min(54, W / n - 6), height: 44, transform: 'none' }} aria-hidden="true">
            <span className="q">?</span>
          </div>
        )}
      </Lane>

      <div className="actions">
        <button className="btn wax" onClick={() => { setRungs(randomRungs(n)); setMsg('The crayons drew it for you!'); }}>Random</button>
        <button className="btn wax" onClick={() => { setRungs([]); setMsg('All clean. Draw again?'); }}>Clear</button>
        <button className="btn main green wax" onClick={onGo}>Go! <Arrow color="#fff" /></button>
      </div>
      <button className="btn" style={{ height: 44, border: 'none', background: 'none', textDecoration: 'underline', fontSize: 18 }} onClick={onBack}>Change players</button>
    </main>
  );
}
