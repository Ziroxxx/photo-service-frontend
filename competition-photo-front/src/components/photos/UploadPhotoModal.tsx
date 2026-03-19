import { Alert, Button, Form, Modal } from 'react-bootstrap';

type Props = {
  show: boolean;
  onHide: () => void;
  competitionTitle: string;
  stageOptions: string[];
  onStartUpload: () => void;
};

export default function UploadPhotoModal({
  show,
  onHide,
  competitionTitle,
  stageOptions,
  onStartUpload,
}: Props) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Загрузка фотографий</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Соревнование</Form.Label>
            <Form.Control value={competitionTitle} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Этап</Form.Label>
            <Form.Select>
              {stageOptions.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Файлы</Form.Label>
            <Form.Control type="file" multiple />
          </Form.Group>

          <Alert variant="light" className="border rounded-4 mb-0">
            Здесь позже будет реальная загрузка файлов на backend.
          </Alert>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button variant="primary" onClick={onStartUpload}>
          Начать загрузку
        </Button>
      </Modal.Footer>
    </Modal>
  );
}