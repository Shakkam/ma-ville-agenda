'use client';

import { useEffect, useRef } from 'react';

// "Clock-app" style wheel time picker. The date stays a native calendar input;
// only the time uses scrollable wheels (hours 0-23, minutes by steps of 5).

const ITEM_H = 34; // px per row
const PAD_ITEMS = 2; // rows above/below the centre → 5 visible rows

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,…,55

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function Wheel({
  values,
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Centre the selected value (on mount and whenever it changes from outside).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = values.indexOf(value);
    if (idx >= 0 && Math.abs(el.scrollTop - idx * ITEM_H) > 1) {
      el.scrollTop = idx * ITEM_H;
    }
  }, [value, values]);

  // Commit + snap once scrolling settles (avoids fighting the user mid-scroll).
  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const idx = Math.max(0, Math.min(values.length - 1, Math.round(el.scrollTop / ITEM_H)));
      if (Math.abs(el.scrollTop - idx * ITEM_H) > 1) {
        el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
      }
      const v = values[idx];
      if (v !== value) onChange(v);
    }, 110);
  };

  return (
    <div
      style={{
        position: 'relative',
        height: ITEM_H * (PAD_ITEMS * 2 + 1),
        width: 54,
        overflow: 'hidden',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* centre highlight band */}
      <div
        style={{
          position: 'absolute',
          top: ITEM_H * PAD_ITEMS,
          left: 0,
          right: 0,
          height: ITEM_H,
          borderTop: '1px solid #cfd8dc',
          borderBottom: '1px solid #cfd8dc',
          background: 'rgba(45,147,196,0.08)',
          borderRadius: 6,
          pointerEvents: 'none',
        }}
      />
      <div
        ref={ref}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className="dt-wheel-scroll"
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent)',
          maskImage:
            'linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent)',
        }}
      >
        <div style={{ height: ITEM_H * PAD_ITEMS }} />
        {values.map((v) => (
          <div
            key={v}
            onClick={() => onChange(v)}
            style={{
              height: ITEM_H,
              lineHeight: `${ITEM_H}px`,
              textAlign: 'center',
              scrollSnapAlign: 'center',
              fontSize: 18,
              fontWeight: v === value ? 700 : 400,
              color: v === value ? '#2d93c4' : '#607d8b',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {pad2(v)}
          </div>
        ))}
        <div style={{ height: ITEM_H * PAD_ITEMS }} />
      </div>
    </div>
  );
}

export function DateTimeField({
  id,
  value,
  onChange,
  min,
  disabled,
}: {
  id?: string;
  value: string; // "YYYY-MM-DDTHH:mm" or ''
  onChange: (v: string) => void;
  min?: string; // "YYYY-MM-DDTHH:mm"
  disabled?: boolean;
}) {
  const [datePart, timePart] = value ? value.split('T') : ['', ''];
  const h = timePart ? parseInt(timePart.slice(0, 2), 10) : 12;
  const rawM = timePart ? parseInt(timePart.slice(3, 5), 10) : 0;
  const m = Math.min(55, Math.round(rawM / 5) * 5); // snap to the 5-min grid

  const minDate = min ? min.split('T')[0] : undefined;
  const timeDisabled = disabled || !datePart;

  const emit = (d: string, hh: number, mm: number) => {
    onChange(d ? `${d}T${pad2(hh)}:${pad2(mm)}` : '');
  };

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        id={id}
        type="date"
        value={datePart}
        min={minDate}
        disabled={disabled}
        required
        onChange={(e) => emit(e.target.value, h, m)}
        style={{
          padding: 12,
          border: '1px solid #e0e0e0',
          borderRadius: 6,
          fontSize: 14,
          fontFamily: 'inherit',
          opacity: disabled ? 0.5 : 1,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: '1px solid #eceff1',
          borderRadius: 10,
          padding: '0 8px',
          background: '#fafbfc',
        }}
      >
        <Wheel
          values={HOURS}
          value={h}
          ariaLabel="Heures"
          disabled={timeDisabled}
          onChange={(hh) => emit(datePart, hh, m)}
        />
        <span style={{ fontSize: 20, fontWeight: 700, color: '#90a4ae' }}>:</span>
        <Wheel
          values={MINUTES}
          value={m}
          ariaLabel="Minutes"
          disabled={timeDisabled}
          onChange={(mm) => emit(datePart, h, mm)}
        />
      </div>

      <style jsx global>{`
        .dt-wheel-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
