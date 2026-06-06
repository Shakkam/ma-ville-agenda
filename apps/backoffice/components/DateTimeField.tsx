'use client';

import { useState } from 'react';
import { ClockTimePicker } from './ClockTimePicker';

function pad2(n: number) {
  return n.toString().padStart(2, '0');
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
  const [showClock, setShowClock] = useState(false);

  const [datePart, timePart] = value ? value.split('T') : ['', ''];
  const h = timePart ? parseInt(timePart.slice(0, 2), 10) : 12;
  const m = timePart ? Math.round(parseInt(timePart.slice(3, 5), 10) / 5) * 5 : 0;

  const minDate = min ? min.split('T')[0] : undefined;
  const timeDisabled = disabled || !datePart;

  const emit = (d: string, hh: number, mm: number) => {
    onChange(d ? `${d}T${pad2(hh)}:${pad2(mm)}` : '');
  };

  const handleConfirm = (hh: number, mm: number) => {
    setShowClock(false);
    emit(datePart, hh, mm);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Native date-only input */}
        <input
          id={id}
          type="date"
          value={datePart}
          min={minDate}
          disabled={disabled}
          required
          onChange={(e) => emit(e.target.value, h, m)}
          style={{
            padding: '10px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'inherit',
            opacity: disabled ? 0.5 : 1,
          }}
        />

        {/* Time display / trigger */}
        <button
          type="button"
          disabled={timeDisabled}
          onClick={() => setShowClock(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 14px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
            background: '#fff',
            fontSize: 16,
            fontWeight: 600,
            color: timeDisabled ? '#bbb' : '#2d93c4',
            cursor: timeDisabled ? 'not-allowed' : 'pointer',
            letterSpacing: 1,
            transition: 'border-color .2s',
          }}
          onMouseEnter={(e) => { if (!timeDisabled) (e.currentTarget as HTMLButtonElement).style.borderColor = '#2d93c4'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0e0e0'; }}
        >
          🕐 {datePart ? `${pad2(h)} : ${pad2(m)}` : '-- : --'}
        </button>
      </div>

      {showClock && (
        <ClockTimePicker
          initialH={h}
          initialM={m}
          onConfirm={handleConfirm}
          onCancel={() => setShowClock(false)}
        />
      )}
    </>
  );
}
