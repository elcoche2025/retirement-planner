import type { ReactNode } from 'react';

interface ToggleOption {
  id: string;
  label: string;
  sublabel?: string;
  content?: ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  selected: string;
  onChange: (id: string) => void;
  accentColor?: string;
}

export default function ToggleGroup({ options, selected, onChange, accentColor }: ToggleGroupProps) {
  return (
    <div className="toggle-group-cards">
      {options.map((opt) => {
        const isSelected = opt.id === selected;
        return (
          <button
            key={opt.id}
            className={`toggle-group-card card${isSelected ? ' toggle-group-card-selected' : ''}`}
            style={
              isSelected && accentColor
                ? ({ '--toggle-accent': accentColor, borderColor: accentColor } as React.CSSProperties)
                : undefined
            }
            onClick={() => onChange(opt.id)}
            type="button"
          >
            <div className="toggle-group-card-header">
              <span className="toggle-group-card-label">{opt.label}</span>
              {opt.sublabel && (
                <span className="toggle-group-card-sublabel">{opt.sublabel}</span>
              )}
            </div>
            {opt.content && <div className="toggle-group-card-content">{opt.content}</div>}
          </button>
        );
      })}
    </div>
  );
}

export type { ToggleOption, ToggleGroupProps };
