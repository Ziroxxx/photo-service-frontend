import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { Lock, Person, Trophy, Upload } from 'react-bootstrap-icons';
import PageContainer from '../components/layout/PageContainer';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <PageContainer>
      <Row className="align-items-center g-4">
        <Col lg={6}>
          <div className="pe-lg-4">
            <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3 py-2 mb-3">
              MVP фронтенд
            </Badge>

            <h1 className="display-5 fw-bold mb-3">
              Сервис хранения и поиска фотографий с соревнований
            </h1>

            <p className="lead text-secondary mb-4">
              Интерфейс  просмотра соревнований и загрузки фотографий.
            </p>

            <ListGroup className="rounded-4 shadow-sm overflow-hidden">
              <ListGroup.Item className="py-3 d-flex align-items-center gap-3 border-0 border-bottom">
                <Lock size={20} />
                Защита фото с помощью водяных знаков и ограничений доступа
              </ListGroup.Item>
              <ListGroup.Item className="py-3 d-flex align-items-center gap-3 border-0 border-bottom">
                <Trophy size={20} />
                Каталог соревнований с фильтрацией по типу
              </ListGroup.Item>
              <ListGroup.Item className="py-3 d-flex align-items-center gap-3 border-0">
                <Upload size={20} />
                Загрузка и скачивание фотографий
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <Row className="g-0">
              <Col md={5} className="auth-side-panel">
                <div>
                  <div className="small text-white-50 mb-2">Добро пожаловать</div>
                  <h3 className="fw-bold mb-3">FindMyPhoto</h3>
                  <p className="mb-0 text-white-50">
                    Платформа для фотографов, участников, организаторов и гостей.
                  </p>
                </div>
              </Col>

              <Col md={7} className="p-4 p-lg-5 bg-white">
                <div className="d-flex gap-2 mb-4">
                  <Button
                    variant={authMode === 'login' ? 'primary' : 'outline-secondary'}
                    className="rounded-pill"
                    onClick={() => setAuthMode('login')}
                  >
                    Вход
                  </Button>

                  <Button
                    variant={authMode === 'register' ? 'primary' : 'outline-secondary'}
                    className="rounded-pill"
                    onClick={() => setAuthMode('register')}
                  >
                    Регистрация
                  </Button>
                </div>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Логин</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Person />
                      </InputGroup.Text>
                      <Form.Control placeholder="Введите логин" />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Пароль</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Lock />
                      </InputGroup.Text>
                      <Form.Control type="password" placeholder="Введите пароль" />
                    </InputGroup>
                  </Form.Group>

                  {authMode === 'register' && (
                    <Form.Group className="mb-4">
                      <Form.Label>Роль</Form.Label>
                      <Form.Select>
                        <option>Фотограф</option>
                        <option>Организатор</option>
                        <option>Участник</option>
                        <option>Гость</option>
                      </Form.Select>
                    </Form.Group>
                  )}

                  <Button variant="primary" className="w-100 rounded-pill py-2">
                    {authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
                  </Button>
                </Form>

                <Alert variant="info" className="mt-4 mb-0 rounded-4">
                  Пока это UI-заглушка. API авторизации подключим позже.
                </Alert>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}