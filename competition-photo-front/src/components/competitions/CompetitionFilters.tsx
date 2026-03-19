import { Alert, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Funnel } from 'react-bootstrap-icons';

type Props = {
  selectedType: string;
  onTypeChange: (value: string) => void;
  count: number;
};

export default function CompetitionFilters({
  selectedType,
  onTypeChange,
  count,
}: Props) {
  return (
    <Card className="border-0 shadow-sm rounded-4 mb-4">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Label className="fw-semibold">Тип соревнования</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Funnel />
              </InputGroup.Text>
              <Form.Select
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
              >
                <option>Все</option>
                <option>Мотоспорт</option>
                <option>Марафон</option>
                <option>Велогонка</option>
                <option>Триатлон</option>
              </Form.Select>
            </InputGroup>
          </Col>

          <Col md={8}>
            <Alert variant="light" className="mb-0 border rounded-4">
              Сейчас отображается <b>{count}</b> соревнований.
            </Alert>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}