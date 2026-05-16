import { Button, Modal } from 'react-bootstrap';
import type { Photo } from '../../types/photo';

type Props = {
  show: boolean;
  onHide: () => void;
  photo: Photo | null;
  stageName?: string;
};

export default function PhotoPreviewModal({ show, onHide, photo, stageName }: Props) {
  if (!photo) {
    return null;
  }

  const imageUrl =
    photo.watermarkedUrl ||
    photo.previewUrl ||
    'https://placehold.co/1200x800?text=Photo';

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {stageName ? `Этап: ${stageName}` : 'Просмотр фотографии'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <img
          src={imageUrl}
          alt={photo.originalFilename}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: 16,
          }}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
}