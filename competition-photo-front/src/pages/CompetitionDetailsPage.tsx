import { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Image,
  InputGroup,
  ProgressBar,
  Row,
  Table,
} from 'react-bootstrap';
import { Camera, Search, Upload } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/layout/SectionTitle';
import PhotoCard from '../components/photos/PhotoCard';
import UploadPhotoModal from '../components/photos/UploadPhotoModal';
import { competitionsMock } from '../data/competitions';
import { photosMock } from '../data/photos';

export default function CompetitionDetailsPage() {
  const { id } = useParams();
  const [selectedStage, setSelectedStage] = useState('Все этапы');
  const [bibFilter, setBibFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const competition = competitionsMock.find((item) => item.id === Number(id)) ?? competitionsMock[0];

  const filteredPhotos = useMemo(() => {
    return photosMock.filter((item) => {
      const byStage = selectedStage === 'Все этапы' || item.stage === selectedStage;
      const byBib = !bibFilter.trim() || item.bib.includes(bibFilter.trim());
      return byStage && byBib;
    });
  }, [selectedStage, bibFilter]);

  return (
    <PageContainer>
      <SectionTitle
        icon={<Camera size={24} />}
        title={competition.title}
        subtitle="Страница конкретного соревнования с фильтрацией по этапу или дню"
      />

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <Row className="g-0">
          <Col lg={4}>
            <Image
              src={competition.cover}
              fluid
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 260 }}
            />
          </Col>

          <Col lg={8}>
            <Card.Body className="p-4 p-lg-5">
              <Row className="g-3">
                <Col md={6}>
                  <div className="text-secondary small">Тип соревнования</div>
                  <div className="fw-semibold">{competition.type}</div>
                </Col>
                <Col md={6}>
                  <div className="text-secondary small">Период проведения</div>
                  <div className="fw-semibold">{competition.dateRange}</div>
                </Col>
                <Col md={6}>
                  <div className="text-secondary small">Локация</div>
                  <div className="fw-semibold">{competition.place}</div>
                </Col>
                <Col md={6}>
                  <div className="text-secondary small">Количество фотографий</div>
                  <div className="fw-semibold">{competition.photosCount}</div>
                </Col>
              </Row>

              <Alert variant="primary" className="mt-4 mb-0 rounded-4">
                Здесь позже появятся реальные данные с backend.
              </Alert>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      <Row className="g-4 mb-4">
        <Col xl={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Фильтры фотографий</h5>
                <Badge bg="secondary" pill>
                  {filteredPhotos.length} найдено
                </Badge>
              </div>

              <Row className="g-3">
                <Col md={4}>
                  <Form.Label>Этап / день</Form.Label>
                  <Form.Select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                  >
                    <option>Все этапы</option>
                    {competition.stageOptions.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={4}>
                  <Form.Label>Номер участника</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Например, 247"
                      value={bibFilter}
                      onChange={(e) => setBibFilter(e.target.value)}
                    />
                  </InputGroup>
                </Col>

                <Col md={4}>
                  <Form.Label>Действия</Form.Label>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      className="w-100 rounded-pill"
                      onClick={() => {
                        setSelectedStage('Все этапы');
                        setBibFilter('');
                      }}
                    >
                      Сбросить
                    </Button>
                    <Button variant="primary" className="w-100 rounded-pill">
                      Применить
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Загрузка фото</h5>
                <Upload />
              </div>

              <p className="text-secondary small">
                UI-заглушка для будущей интеграции загрузки на сервер.
              </p>

              <Button
                className="w-100 rounded-pill mb-3"
                onClick={() => setShowUploadModal(true)}
              >
                Загрузить фотографии
              </Button>

              <div className="small text-secondary mb-2">Текущий прогресс загрузки</div>
              <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} style={{ height: 10 }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {filteredPhotos.map((item) => (
          <Col md={6} xl={4} key={item.id}>
            <PhotoCard item={item} />
          </Col>
        ))}
      </Row>

      <UploadPhotoModal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        competitionTitle={competition.title}
        stageOptions={competition.stageOptions}
        onStartUpload={() => {
          setUploadProgress(78);
          setShowUploadModal(false);
        }}
      />
    </PageContainer>
  );
}