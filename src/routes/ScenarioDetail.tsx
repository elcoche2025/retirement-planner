import { useParams } from 'react-router-dom';

export default function ScenarioDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="page-enter">
      <h1>Scenario: {id}</h1>
    </div>
  );
}
