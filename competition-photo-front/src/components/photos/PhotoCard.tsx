import { Badge, Button, Card } from 'react-bootstrap';
import type { PhotoItem } from '../../types/photo';

type Props = {
  item: PhotoItem;
};

export default function PhotoCard({ item }: Props) {
  return (
    <Card className="border-0 shadow-sm h-100 overflow-hidden rounded-4">
      <div className="position-relative">
        <Card.Img src={item.preview} style={{ height: 210, objectFit: 'cover' }} />
        <div className="watermark-label">WATERMARK PREVIEW</div>

        <Badge bg="dark" className="position-absolute top-0 end-0 m-3 rounded-pill px-3 py-2">
          № {item.bib}
        </Badge>
      </div>

      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="fw-semibold">Этап: {item.stage}</div>
          <small className="text-secondary">{item.day}</small>
        </div>

        <div className="text-secondary small mb-3">Фотограф: {item.author}</div>

        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" className="rounded-pill px-3">
            Выбрать
          </Button>
          <Button variant="primary" size="sm" className="rounded-pill px-3">
            Скачать
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}