
import React from 'react';
import Image from 'next/image';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Divide } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
export default function Header() {
    const { user, logout } = useAuth();
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <div className="d-flex w-100 align-items-center py-3">
        <Navbar.Brand href="#home">
            <Image
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={25}
            priority
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
          <Nav className="ms-auto">
            <Nav.Link href="#pricing">Shop</Nav.Link>
            <Nav.Link href="#pricing">MLM</Nav.Link>
                { user && (
                <NavDropdown title="Profile" id="collapsible-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Dashboard</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Orders</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Address</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <button className="btn w-100 btn-danger" onClick={logout}>
                        Logout
                    </button>
                </NavDropdown>
                )}
                {
                !user && (
                <Nav.Link href="/login">Login</Nav.Link>
                )}
          </Nav>
        </Navbar.Collapse>
        </div>
      </Container>
    </Navbar>
  );
}

  


/*  <header className="bg-light border-bottom shadow-sm mb-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center py-3">
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={25}
            priority
          />
          <nav>
            <ul className="nav">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Users
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Products
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Orders
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Profile
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/logout">
                  Logout
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    */