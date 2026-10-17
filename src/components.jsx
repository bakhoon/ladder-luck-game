import React from 'react';
import { W, H, colX, toPoints } from './ladder.js';

export function Buddy({ color, size = 44 }) {
  const eye = Math.max(4, Math.round(size / 7));
  return (
    <span className="buddy wax" style={{ width: size, height: size, backgroundColor: color, gap: size / 5 }} aria-hidden="true">
      <i style={{ width: eye, height: eye * 1.3 }} />
      <i style={{ width: eye, height: eye * 1.3 }} />
    </span>
  );
}

export function Header({ step, title, big, right }) {
  return (
    <div>
      <div className="top">
        <span className="pill wax">STEP {step} / 3</span>
        {right ?? (
          <span className="dots" aria-hidden="true">
            {[1, 2, 3].map((i) => <span key={i} className={i === step ? 'on wax' : ''} />)}
          </span>
        )}
      </div>
      <h1 className={big ? 'big' : ''}>{title}</h1>
    </div>
  );
}

export function Arrow({ color = '#3A2E26' }) {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden="true">
      <path d="M3 10.5 L22 9.5 M15 3 L22.5 9.8 L15.5 17" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusMinus({ plus }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d={plus ? 'M3 9.5 L15 8.5 M9.5 3 L8.5 15' : 'M3 9.5 L15 8.5'} stroke="#3A2E26" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Lanes of absolutely placed items, one per ladder line.
export function Lane({ n, height, children }) {
  return (
    <div className="lane" style={{ height }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="lane-item" style={{ left: `${(colX(i, n) / W) * 100}%` }}>
          {children(i)}
        </div>
      ))}
    </div>
  );
}

// The ladder itself: one crayon line per buddy plus the drawn rungs.
export function LadderSvg({ n, colors, rungs, faded, children, svgRef, label }) {
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <defs>
        <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" />
        </filter>
      </defs>
      <g filter="url(#crayon)" strokeLinecap="round">
        {Array.from({ length: n }, (_, i) => (
          <line key={i} x1={colX(i, n)} y1={2} x2={colX(i, n)} y2={H - 2} stroke={colors[i]} strokeWidth="7" opacity={faded ? 0.35 : 1} />
        ))}
        {rungs.map((r) => (
          <line key={r.id} x1={colX(r.a, n)} y1={r.y1} x2={colX(r.a + 1, n)} y2={r.y2} stroke={r.color} strokeWidth="7.5" opacity={faded ? 0.5 : 1} />
        ))}
      </g>
      {children}
    </svg>
  );
}

export function CrayonPath({ points, color }) {
  return (
    <g filter="url(#crayon)" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={toPoints(points)} stroke="#3A2E26" strokeWidth="12" opacity="0.55" />
      <polyline points={toPoints(points)} stroke={color} strokeWidth="8.5" />
    </g>
  );
}
