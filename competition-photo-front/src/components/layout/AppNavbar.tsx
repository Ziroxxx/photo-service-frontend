import { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getCurrentUser, subscribeAuthChanged } from '../../app/authStorage';
import { APP_ROUTES } from '../../shared/constants';
import UserBurgerMenu from './UserBurgerMenu';

export default function AppNavbar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    return subscribeAuthChanged(() => {
      setCurrentUser(getCurrentUser());
    });
  }, []);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [location.pathname]);

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to={currentUser ? APP_ROUTES.competitions : APP_ROUTES.auth} className="fw-bold">
          FindMyPhoto
        </Navbar.Brand>
        
        <Nav className="ms-auto">
          {currentUser ? (
            <UserBurgerMenu user={currentUser} />
          ) : (
            <Nav.Link as={NavLink} to={APP_ROUTES.auth}>
              Войти
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}