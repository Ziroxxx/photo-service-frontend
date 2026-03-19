import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export default function SectionTitle({ icon, title, subtitle }: Props) {
  return (
    <div className="d-flex align-items-start gap-3 mb-4">
      <div className="section-icon">{icon}</div>
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        <div className="text-secondary">{subtitle}</div>
      </div>
    </div>
  );
}