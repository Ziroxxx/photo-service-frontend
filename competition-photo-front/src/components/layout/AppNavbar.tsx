import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Images } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/competitions') {
      return location.pathname === '/competitions';
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/competition-details') {
      return location.pathname.startsWith('/competitions/');
    }
    return false;
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm sticky-top">
      <Container>
        <Navbar.Brand
          className="fw-bold d-flex align-items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <span className="brand-icon">
            <Images size={18} />
          </span>
          FindMyPhoto
        </Navbar.Brand>

        <Nav className="ms-auto d-flex flex-row gap-2">
          <Button
            variant={isActive('/') ? 'primary' : 'outline-primary'}
            className="rounded-pill"
            onClick={() => navigate('/')}
          >
            Аутентификация
          </Button>

          <Button
            variant={isActive('/competitions') ? 'primary' : 'outline-primary'}
            className="rounded-pill"
            onClick={() => navigate('/competitions')}
          >
            Соревнования
          </Button>

          <Button
            variant={isActive('/competition-details') ? 'primary' : 'outline-primary'}
            className="rounded-pill"
            onClick={() => navigate('/competitions/1')}
          >
            Карточка соревнования
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}