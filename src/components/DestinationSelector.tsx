import { ALL_DESTINATIONS } from '@/data/destinations';

interface DestinationSelectorProps {
  value: string;
  onChange: (id: string) => void;
  exclude?: string[];
}

export default function DestinationSelector({ value, onChange, exclude = [] }: DestinationSelectorProps) {
  const options = ALL_DESTINATIONS.filter((d) => !exclude.includes(d.id));

  return (
    <select
      className="destination-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((d) => (
        <option key={d.id} value={d.id}>
          {d.flag} {d.name}
        </option>
      ))}
    </select>
  );
}
