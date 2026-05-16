import type { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import AppNavbar from './AppNavbar';

type Props = {
  children: ReactNode;
  fluid?: boolean;
};

export default function PageContainer({ children, fluid = false }: Props) {
  return (
    <div className="app-bg min-vh-100">
      <AppNavbar />
      <Container fluid={fluid} className="py-5">{children}</Container>
    </div>
  );
}