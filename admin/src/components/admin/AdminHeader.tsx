'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-bottom p-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="mb-0 text-dark">Dashboard</h2>
          <small className="text-muted">Welcome back, {user?.firstName}</small>
        </div>
        
        <div className="d-flex align-items-center">
          <div className="input-group me-3" style={{ width: '300px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
            />
            <button className="btn btn-outline-secondary">
              <i className="bi bi-search"></i>
            </button>
          </div>
          
          <button className="btn btn-outline-secondary me-3 position-relative">
            <i className="bi bi-bell"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </button>
          
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-circle me-2"></i>
              {user?.firstName} {user?.lastName}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="#">
                  <i className="bi bi-person me-2"></i>Profile
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  <i className="bi bi-gear me-2"></i>Settings
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}