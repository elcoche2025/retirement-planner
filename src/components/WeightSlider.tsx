import SliderInput from '@/components/SliderInput';

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

function importanceLabel(value: number): string {
  if (value <= 2) return 'Low';
  if (value <= 4) return 'Medium';
  if (value <= 6) return 'High';
  if (value <= 8) return 'Very High';
  return 'Critical';
}

export default function WeightSlider({ label, value, onChange, description }: WeightSliderProps) {
  return (
    <div className="weight-slider">
      <SliderInput
        label={label}
        value={value}
        onChange={onChange}
        min={0}
        max={10}
        step={1}
        format={(v) => `${v} — ${importanceLabel(v)}`}
      />
      {description && <div className="weight-slider-desc">{description}</div>}
    </div>
  );
}
