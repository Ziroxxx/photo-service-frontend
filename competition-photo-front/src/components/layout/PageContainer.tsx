import type { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import AppNavbar from './AppNavbar';

type Props = {
  children: ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <div className="app-bg min-vh-100">
      <AppNavbar />
      <Container className="py-5">{children}</Container>
    </div>
  );
}