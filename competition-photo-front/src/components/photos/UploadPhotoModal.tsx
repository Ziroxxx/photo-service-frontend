import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import type { CompetitionStage } from '../../types/competition';

type UploadPayload = {
  stageId?: string;
  files: File[];
};

type Props = {
  show: boolean;
  onHide: () => void;
  competitionTitle: string;
  stages: CompetitionStage[];
  isUploading: boolean;
  onStartUpload: (payload: UploadPayload) => Promise<void>;
};

export default function UploadPhotoModal({
  show,
  onHide,
  competitionTitle,
  stages,
  isUploading,
  onStartUpload,
}: Props) {
  const [selectedStageId, setSelectedStageId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.sortOrder - b.sortOrder),
    [stages],
  );

  useEffect(() => {
    if (!show) return;

    setSelectedStageId(sortedStages[0]?.id ?? '');
    setFiles([]);
    setError('');
  }, [show, sortedStages]);

  const handleSubmit = () => {
    setError('');

    if (files.length === 0) {
      setError('Выбери хотя бы один файл');
      return;
    }

    void onStartUpload({
      stageId: selectedStageId || undefined,
      files,
    });
  };

  return (
    <Modal show={show} onHide={isUploading ? undefined : onHide} centered>
      <Modal.Header closeButton={!isUploading}>
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
            <Form.Select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              disabled={isUploading || sortedStages.length === 0}
            >
              {sortedStages.length === 0 ? (
                <option value="">Этапы отсутствуют</option>
              ) : (
                sortedStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))
              )}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Файлы</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              disabled={isUploading}
              onChange={(e) => {
                const input = e.currentTarget as HTMLInputElement;
                const selectedFiles = Array.from(input.files ?? []);
                setFiles(selectedFiles);
              }}
            />
            <Form.Text className="text-secondary">
              {files.length > 0
                ? `Выбрано файлов: ${files.length}`
                : 'Можно выбрать сразу несколько изображений'}
            </Form.Text>
          </Form.Group>

          {error ? (
            <Alert variant="danger" className="mb-0 rounded-4">
              {error}
            </Alert>
          ) : (
            <Alert variant="light" className="border rounded-4 mb-0">
              После отправки начнётся загрузка оригиналов и обработка изображений на сервере.
            </Alert>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={isUploading}>
          Отмена
        </Button>

        <Button variant="primary" onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Загрузка...
            </>
          ) : (
            'Начать загрузку'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}