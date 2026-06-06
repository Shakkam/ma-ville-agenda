'use client';

import { useRef, useState } from 'react';

// Material-style analog clock time picker (24h): pick the hour on the dial,
// then the minutes (locked to 5-min steps). Tap a number or drag the hand.

const SIZE = 260;
const C = SIZE / 2;
const R_OUT = 104; // outer ring radius (1-12 hours / minutes)
const R_IN = 66; // inner ring radius (13-23 + 00)
const NUM_R = 20; // selection/number circle radius
const PRIMARY = '#2d93c4';

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

// Position of clock index i (0=top, clockwise) at radius r.
function pos(i: number, r: number) {
  const a = (i * 30 * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

const HOURS_OUTER = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i)); // 12,1..11
const HOURS_INNER = Array.from({ length: 12 }, (_, i) => (i === 0 ? 0 : i + 12)); // 00,13..23
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5..55

export function ClockTimePicker({
  initialH,
  initialM,
  onConfirm,
  onCancel,
}: {
  initialH: number;
  initialM: number;
  onConfirm: (h: number, m: number) => void;
  onCancel: () => void;
}) {
  const [h, setH] = useState(initialH);
  const [m, setM] = useState(initialM);
  const [mode, setMode] = useState<'h' | 'm'>('h');
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const pick = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((clientX - rect.left) / rect.width) * SIZE - C;
    const dy = ((clientY - rect.top) / rect.height) * SIZE - C;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    deg = (deg + 360) % 360;
    const idx = Math.round(deg / 30) % 12;
    if (mode === 'h') {
      const outer = Math.hypot(dx, dy) > (R_OUT + R_IN) / 2;
      setH(outer ? (idx === 0 ? 12 : idx) : idx === 0 ? 0 : idx + 12);
    } else {
      setM((idx * 5) % 60);
    }
  };

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pick(e.clientX, e.clientY);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) pick(e.clientX, e.clientY);
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (mode === 'h') setMode('m'); // hour chosen → move on to minutes
  };

  // Current selection position (for the hand + highlight).
  let selIdx: number;
  let selR: number;
  if (mode === 'h') {
    const outer = h >= 1 && h <= 12;
    selIdx = outer ? h % 12 : h === 0 ? 0 : h - 12;
    selR = outer ? R_OUT : R_IN;
  } else {
    selIdx = m / 5;
    selR = R_OUT;
  }
  const sel = pos(selIdx, selR);

  const renderNumbers = (vals: number[], r: number, isHour: boolean) =>
    vals.map((v, i) => {
      const p = pos(i, r);
      const selected = isHour ? v === h && (mode === 'h') : v === m && mode === 'm';
      return (
        <text
          key={`${r}-${v}`}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={r === R_IN ? 13 : 16}
          fontWeight={selected ? 700 : 400}
          fill={selected ? '#fff' : '#37474f'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {pad2(v)}
        </text>
      );
    });

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 20,
          width: 312,
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header: HH : MM (click to switch mode) */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setMode('h')}
            style={timeBtnStyle(mode === 'h')}
          >
            {pad2(h)}
          </button>
          <span style={{ fontSize: 40, fontWeight: 300, color: '#90a4ae' }}>:</span>
          <button
            type="button"
            onClick={() => setMode('m')}
            style={timeBtnStyle(mode === 'm')}
          >
            {pad2(m)}
          </button>
        </div>

        {/* Clock face */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          style={{ touchAction: 'none', display: 'block', margin: '0 auto', cursor: 'pointer' }}
        >
          <circle cx={C} cy={C} r={C - 2} fill="#f1f4f6" />
          {/* hand */}
          <line x1={C} y1={C} x2={sel.x} y2={sel.y} stroke={PRIMARY} strokeWidth={2} />
          <circle cx={C} cy={C} r={4} fill={PRIMARY} />
          <circle cx={sel.x} cy={sel.y} r={NUM_R} fill={PRIMARY} />
          {/* numbers */}
          {mode === 'h' ? (
            <>
              {renderNumbers(HOURS_OUTER, R_OUT, true)}
              {renderNumbers(HOURS_INNER, R_IN, true)}
            </>
          ) : (
            renderNumbers(MINUTES, R_OUT, false)
          )}
        </svg>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={onCancel} style={actionStyle(false)}>
            Annuler
          </button>
          <button type="button" onClick={() => onConfirm(h, m)} style={actionStyle(true)}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function timeBtnStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 40,
    fontWeight: 400,
    minWidth: 78,
    padding: '4px 8px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    color: active ? PRIMARY : '#455a64',
    background: active ? 'rgba(45,147,196,0.12)' : 'transparent',
  };
}

function actionStyle(primary: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    color: primary ? '#fff' : PRIMARY,
    background: primary ? PRIMARY : 'transparent',
  };
}
