import { Badge, Button, Card } from 'react-bootstrap';
import { Calendar3, GeoAlt, PencilSquare } from 'react-bootstrap-icons';
import type { Competition } from '../../types/competition';

type Props = {
  competition: Competition;
  onEdit: (competition: Competition) => void;
};

function formatPlace(competition: Competition) {
  const parts = [competition.city, competition.venue].filter(Boolean);
  return parts.length > 0 ? parts.join(' • ') : 'Пусто';
}

function formatDateRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  return `${start.toLocaleDateString('ru-RU')} — ${end.toLocaleDateString('ru-RU')}`;
}

function formatStatus(status: Competition['status']) {
  switch (status) {
    case 'draft':
      return 'Черновик';
    case 'published':
      return 'Опубликовано';
    case 'archived':
      return 'Архив';
    default:
      return status;
  }
}

export default function ManageCompetitionCard({ competition, onEdit }: Props) {
  return (
    <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden">
      <Card.Img
        src={competition.coverUrl || 'https://placehold.co/800x400?text=Competition'}
        style={{ height: 220, objectFit: 'cover' }}
      />

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
          <Card.Title className="fw-bold mb-0">{competition.title}</Card.Title>
          <Badge bg="primary" pill>
            {competition.type}
          </Badge>
        </div>

        <div className="text-secondary small mb-2 d-flex align-items-center gap-2">
          <GeoAlt />
          {formatPlace(competition)}
        </div>

        <div className="text-secondary small mb-3 d-flex align-items-center gap-2">
          <Calendar3 />
          {formatDateRange(competition.startAt, competition.endAt)}
        </div>

        <Card.Text className="text-secondary">
          {competition.description?.trim() || 'Пусто'}
        </Card.Text>

        <div className="mt-auto d-flex justify-content-between align-items-center pt-2">
          <div className="small text-secondary">
            Статус: <b>{formatStatus(competition.status)}</b>
          </div>

          <Button className="rounded-pill px-3 d-inline-flex align-items-center gap-2" onClick={() => onEdit(competition)}>
            <PencilSquare />
            Изменить
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}