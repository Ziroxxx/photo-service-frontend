import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import type {
  CompetitionFilterOptions,
  CompetitionFilterValues,
} from './CompetitionFiltersHelpers';

type Props = {
  value: CompetitionFilterValues;
  options: CompetitionFilterOptions;
  count: number;
  onChange: (next: CompetitionFilterValues) => void;
  onReset: () => void;
};

export default function CompetitionFilters({
  value,
  options,
  count,
  onChange,
  onReset,
}: Props) {
  const updateField = <K extends keyof CompetitionFilterValues>(
    key: K,
    nextValue: CompetitionFilterValues[K],
  ) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4">
      <Card.Body className="p-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Фильтры соревнований</h5>
            <div className="text-secondary small">
              Найдено соревнований: <b>{count}</b>
            </div>
          </div>

          <Button
            variant="outline-secondary"
            className="rounded-pill"
            onClick={onReset}
          >
            Сбросить
          </Button>
        </div>

        <Row className="g-3">
          <Col md={6} xl={4}>
            <Form.Group>
              <Form.Label>Название</Form.Label>
              <Form.Control
                value={value.query}
                onChange={(e) => updateField('query', e.target.value)}
                placeholder="Поиск по названию"
              />
            </Form.Group>
          </Col>

          <Col md={6} xl={4}>
            <Form.Group>
              <Form.Label>Дата начала</Form.Label>
              <Form.Control
                type="date"
                value={value.startDateFrom}
                onChange={(e) => updateField('startDateFrom', e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6} xl={4}>
            <Form.Group>
              <Form.Label>Дата конца</Form.Label>
              <Form.Control
                type="date"
                value={value.endDateTo}
                onChange={(e) => updateField('endDateTo', e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={6} xl={4}>
            <Form.Group>
              <Form.Label>Статус</Form.Label>
              <Form.Select
                value={value.status}
                onChange={(e) => updateField('status', e.target.value)}
              >
                {options.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} xl={4}>
            <Form.Group>
              <Form.Label>Тип соревнования</Form.Label>
              <Form.Select
                value={value.type}
                onChange={(e) => updateField('type', e.target.value)}
              >
                {options.types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} xl={4}>
            <Form.Group>
              <Form.Label>Город</Form.Label>
              <Form.Select
                value={value.city}
                onChange={(e) => updateField('city', e.target.value)}
              >
                {options.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}