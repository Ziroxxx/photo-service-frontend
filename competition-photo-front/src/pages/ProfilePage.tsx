import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../app/authStorage';
import PageContainer from '../components/layout/PageContainer';
import { APP_ROUTES } from '../shared/constants';

export default function ProfilePage() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  return (
    <PageContainer>
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h2 className="fw-bold mb-4">Профиль пользователя</h2>

              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-3">
                  <div className="small text-secondary">Логин</div>
                  <div className="fw-semibold">{currentUser.login}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0 py-3">
                  <div className="small text-secondary">Имя</div>
                  <div className="fw-semibold">{currentUser.fullName}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0 py-3">
                  <div className="small text-secondary">Роль</div>
                  <div className="fw-semibold">{currentUser.role}</div>
                </ListGroup.Item>

                <ListGroup.Item className="px-0 py-3">
                  <div className="small text-secondary">Статус</div>
                  <div className="fw-semibold">{currentUser.status}</div>
                </ListGroup.Item>

                {currentUser.phone ? (
                  <ListGroup.Item className="px-0 py-3">
                    <div className="small text-secondary">Телефон</div>
                    <div className="fw-semibold">{currentUser.phone}</div>
                  </ListGroup.Item>
                ) : null}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}