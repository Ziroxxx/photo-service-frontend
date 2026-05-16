import { useEffect, useMemo, useState } from 'react';
import { Alert, Col, Row, Spinner } from 'react-bootstrap';
import { Trophy } from 'react-bootstrap-icons';
import { getCompetitions } from '../api/competitions';
import CompetitionCard from '../components/competitions/CompetitionCard';
import CompetitionFilters from '../components/competitions/CompetitionFilters';
import {
  applyCompetitionFilters,
  buildCompetitionFilterOptions,
  createDefaultCompetitionFilters,
  type CompetitionFilterValues,
} from '../components/competitions/CompetitionFiltersHelpers';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/layout/SectionTitle';
import type { Competition } from '../types/competition';
import { getCurrentUser } from '../app/authStorage';

function mapCompetitionsError(message: string) {
  if (message.includes('forbidden')) {
    return 'Недостаточно прав для просмотра соревнований';
  }

  return message || 'Не удалось загрузить соревнования';
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filters, setFilters] = useState<CompetitionFilterValues>(
    createDefaultCompetitionFilters(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const loadCompetitions = async () => {
      setIsLoading(true);
      setError('');

      try {
        const dataAllCompetitions = await getCompetitions();
        if(isAdmin){
          setCompetitions(dataAllCompetitions);
        }
        else{
          const data = dataAllCompetitions.filter((el) => el.status !== 'draft');
          setCompetitions(data);
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Произошла ошибка';
        setError(mapCompetitionsError(message));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCompetitions();
  }, []);

  const filterOptions = useMemo(
    () => buildCompetitionFilterOptions(competitions),
    [competitions],
  );

  const filteredCompetitions = useMemo(
    () => applyCompetitionFilters(competitions, filters),
    [competitions, filters],
  );

  return (
    <PageContainer>
      <SectionTitle
        icon={<Trophy size={24} />}
        title="Соревнования"
        subtitle="Каталог событий с фильтрацией по параметрам"
      />

      <CompetitionFilters
        value={filters}
        options={filterOptions}
        count={filteredCompetitions.length}
        onChange={setFilters}
        onReset={() => setFilters(createDefaultCompetitionFilters())}
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {isLoading ? (
        <div className="py-5 text-center">
          <Spinner />
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <Alert variant="light" className="border rounded-4">
          Соревнования не найдены
        </Alert>
      ) : (
        <Row className="g-4">
          {filteredCompetitions.map((competition) => (
            <Col md={6} xl={4} key={competition.id}>
              <CompetitionCard competition={competition} />
            </Col>
          ))}
        </Row>
      )}
    </PageContainer>
  );
}