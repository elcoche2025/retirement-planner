import { useCallback, useRef } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
  suffix?: string;
}

export default function SliderInput({ label, value, onChange, min, max, step, format, suffix }: SliderInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const displayValue = format ? format(value) : `${value}${suffix ?? ''}`;

  return (
    <div className="slider-input-row">
      <div className="slider-input-header">
        <span className="slider-input-label">{label}</span>
        <span className="slider-input-value mono">{displayValue}</span>
      </div>
      <div className="slider-input">
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={{
            background: `linear-gradient(to right, var(--color-highlight) 0%, var(--color-highlight) ${pct}%, var(--color-bg-tertiary) ${pct}%, var(--color-bg-tertiary) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
