import { Info } from 'lucide-react';

export interface PageGuideSection {
  title: string;
  body: string;
}

interface PageGuideProps {
  title?: string;
  intro?: string;
  sections: PageGuideSection[];
}

export default function PageGuide({
  title = 'Assumptions & Sources',
  intro,
  sections,
}: PageGuideProps) {
  return (
    <details className="page-guide card">
      <summary className="page-guide-summary">
        <span className="page-guide-summary-left">
          <Info size={16} />
          <span>{title}</span>
        </span>
        <span className="page-guide-summary-right">Open</span>
      </summary>

      <div className="page-guide-body">
        {intro && <p className="page-guide-intro">{intro}</p>}
        <div className="page-guide-sections">
          {sections.map((section) => (
            <section key={section.title} className="page-guide-section">
              <h4>{section.title}</h4>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </details>
  );
}
