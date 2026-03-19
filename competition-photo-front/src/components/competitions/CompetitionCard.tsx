import { Badge, Button, Card } from 'react-bootstrap';
import { Calendar3, GeoAlt } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import type { Competition } from '../../types/competition';

type Props = {
  competition: Competition;
};

export default function CompetitionCard({ competition }: Props) {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden">
      <Card.Img src={competition.cover} style={{ height: 220, objectFit: 'cover' }} />
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
          <Card.Title className="fw-bold mb-0">{competition.title}</Card.Title>
          <Badge bg="primary" pill>
            {competition.type}
          </Badge>
        </div>

        <div className="text-secondary small mb-2 d-flex align-items-center gap-2">
          <GeoAlt /> {competition.place}
        </div>

        <div className="text-secondary small mb-3 d-flex align-items-center gap-2">
          <Calendar3 /> {competition.dateRange}
        </div>

        <Card.Text className="text-secondary">{competition.description}</Card.Text>

        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
          <div className="small text-secondary">
            Фото: <b>{competition.photosCount}</b>
          </div>
          <Button
            className="rounded-pill px-3"
            onClick={() => navigate(`/competitions/${competition.id}`)}
          >
            Открыть
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}