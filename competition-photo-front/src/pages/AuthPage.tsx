import { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, InputGroup, ListGroup, Row, Spinner } from 'react-bootstrap';
import { Lock, Person, At, Trophy, Upload } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { login, register } from '../api/auth';
import { saveAuth } from '../app/authStorage';

type AuthMode = 'login' | 'register';

function mapAuthError(message: string) {
  if (message.includes('invalid credentials')) {
    return 'Неверный логин или пароль';
  }

  if (message.includes('user is not active')) {
    return 'Аккаунт заблокирован';
  }

  if (message.includes('login is already taken') || message.includes('login already exists')) {
    return 'Этот логин уже занят';
  }

  if (message.includes("RegisterRequest.FullName")) {
    return 'Введите имя';
  }

  return message || 'Произошла ошибка';
}

export default function AuthPage() {
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [loginValue, setLoginValue] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitButtonText = useMemo(
    () => (authMode === 'login' ? 'Войти' : 'Создать аккаунт'),
    [authMode],
  );

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetMessages();
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    if (!loginValue.trim()) {
      setError('Введите логин');
      return;
    }

    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    if (authMode === 'register' && !fullName.trim()) {
      setError('Введите имя');
      return;
    }

    if(authMode === 'register' && loginValue.trim().length < 3){
      setError('Минимальная длина лонина: 3 символа')
      return
    }

    if(authMode === 'register' && fullName.trim().length < 2){
      setError('Минимальная длина имени: 2 символа')
      return
    }

    if(authMode === 'register' && password.trim().length < 8){
      setError('Минимальная длина пароля: 8 символов')
      return
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const data = await login({
          login: loginValue.trim(),
          password,
        });

        saveAuth(data);
        navigate('/competitions');
      } else {
        await register({
          login: loginValue.trim(),
          password,
          fullName: fullName.trim(),
        });

        setSuccess('Аккаунт создан. Теперь войдите в систему.');
        setAuthMode('login');
        setPassword('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка';
      setError(mapAuthError(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Row className="align-items-center g-4">
        <Col lg={6}>
          <div className="pe-lg-4">
            <h1 className="display-5 fw-bold mb-3">
              Сервис хранения и поиска фотографий с соревнований
            </h1>

            <p className="lead text-secondary mb-4">
              Интерфейс просмотра соревнований и загрузки фотографий.
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
                    onClick={() => switchMode('login')}
                    disabled={isSubmitting}
                  >
                    Вход
                  </Button>

                  <Button
                    variant={authMode === 'register' ? 'primary' : 'outline-secondary'}
                    className="rounded-pill"
                    onClick={() => switchMode('register')}
                    disabled={isSubmitting}
                  >
                    Регистрация
                  </Button>
                </div>

                {error ? <Alert variant="danger">{error}</Alert> : null}
                {success ? <Alert variant="success">{success}</Alert> : null}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Логин</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <At />
                      </InputGroup.Text>
                      <Form.Control
                        value={loginValue}
                        onChange={(e) => setLoginValue(e.target.value)}
                        placeholder="Введите логин"
                        disabled={isSubmitting}
                      />
                    </InputGroup>
                  </Form.Group>

                  {authMode === 'register' ? (
                    <Form.Group className="mb-3">
                      <Form.Label>Имя</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <Person />
                        </InputGroup.Text>
                        <Form.Control
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Введите имя"
                          disabled={isSubmitting}
                        />
                      </InputGroup>
                    </Form.Group>
                  ) : null}

                  <Form.Group className="mb-3">
                    <Form.Label>Пароль</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Lock />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль"
                        disabled={isSubmitting}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 rounded-pill py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Загрузка...
                      </>
                    ) : (
                      submitButtonText
                    )}
                  </Button>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}