import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Trophy } from 'react-bootstrap-icons';
import CompetitionCard from '../components/competitions/CompetitionCard';
import CompetitionFilters from '../components/competitions/CompetitionFilters.tsx';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/layout/SectionTitle';
import { competitionsMock } from '../data/competitions';

export default function CompetitionsPage() {
  const [selectedType, setSelectedType] = useState('Все');

  const filteredCompetitions = useMemo(() => {
    if (selectedType === 'Все') {
      return competitionsMock;
    }

    return competitionsMock.filter((item) => item.type === selectedType);
  }, [selectedType]);

  return (
    <PageContainer>
      <SectionTitle
        icon={<Trophy size={24} />}
        title="Страница соревнований"
        subtitle="Каталог событий с фильтром по типу соревнования"
      />

      <CompetitionFilters
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        count={filteredCompetitions.length}
      />

      <Row className="g-4">
        {filteredCompetitions.map((competition) => (
          <Col md={6} xl={4} key={competition.id}>
            <CompetitionCard competition={competition} />
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}