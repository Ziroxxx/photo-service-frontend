import { useEffect, useState } from 'react';
import { Alert, Button, Col, Row, Spinner } from 'react-bootstrap';
import { Download, HeartFill } from 'react-bootstrap-icons';
import { Navigate } from 'react-router-dom';
import {
  getFavoritePhotos,
  removeFavoritePhoto,
  subscribeFavoritesChanged,
  type FavoritePhotoItem,
} from '../app/favoritesStorage';
import { getCurrentUser } from '../app/authStorage';
import { downloadPhotosBatch } from '../api/downloads';
import PageContainer from '../components/layout/PageContainer';
import SectionTitle from '../components/layout/SectionTitle';
import PhotoPreviewModal from '../components/photos/PhotoPreviewModal';
import PhotoCard from '../components/photos/PhotoCard';
import { APP_ROUTES } from '../shared/constants';

export default function FavoritesPage() {
  const currentUser = getCurrentUser();

  const [items, setItems] = useState<FavoritePhotoItem[]>(getFavoritePhotos());
  const [selectedItem, setSelectedItem] = useState<FavoritePhotoItem | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return subscribeFavoritesChanged(() => {
      setItems(getFavoritePhotos());
    });
  }, []);

  if (!currentUser) {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  const handleDownloadAll = async () => {
    try {
      setError('');
      setIsDownloadingAll(true);
      await downloadPhotosBatch(items.map((item) => item.photo.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось скачать фотографии';
      setError(message);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <PageContainer>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <SectionTitle
          icon={<HeartFill size={24} />}
          title="Понравившиеся фото"
          subtitle="Избранные фотографии, отмеченные сердечком"
        />

        {items.length > 0 ? (
          <Button
            className="rounded-pill d-inline-flex align-items-center gap-2"
            onClick={handleDownloadAll}
            disabled={isDownloadingAll}
          >
            {isDownloadingAll ? <Spinner size="sm" /> : <Download size={18} />}
            Скачать всё
          </Button>
        ) : null}
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {items.length === 0 ? (
        <Alert variant="light" className="border rounded-4">
          Пока нет понравившихся фото
        </Alert>
      ) : (
        <Row className="g-4">
          {items.map((item) => (
            <Col md={6} xl={4} key={item.photo.id}>
              <div className="mb-2 small text-secondary">
                {item.competitionTitle || 'Соревнование'}
              </div>

              <PhotoCard
                photo={item.photo}
                stageName={item.stageName}
                stageDate={item.stageDate}
                competitionTitle={item.competitionTitle}
                favoriteControlMode="remove"
                onRemoveFavorite={(photo) => removeFavoritePhoto(photo.id)}
                onOpen={() => setSelectedItem(item)}
              />
            </Col>
          ))}
        </Row>
      )}

      <PhotoPreviewModal
        show={Boolean(selectedItem)}
        onHide={() => setSelectedItem(null)}
        photo={selectedItem?.photo ?? null}
        stageName={selectedItem?.stageName}
      />
    </PageContainer>
  );
}