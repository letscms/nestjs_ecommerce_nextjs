'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: 'bi-speedometer2' },
  { name: 'Users', href: '/admin/users', icon: 'bi-people' },
  { name: 'Categories', href: '/admin/category', icon: 'bi-box' },
  { name: 'Products', href: '/admin/products', icon: 'bi-box' },
  { name: 'Orders', href: '/admin/orders', icon: 'bi-cart' },
  { name: 'Settings', href: '/admin/settings', icon: 'bi-gear' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="bg-dark text-white admin-sidebar">
      <div className="p-3 border-bottom border-secondary">
        <h4 className="mb-0">
          <i className="bi bi-shield-check me-2"></i>
          Admin Panel
        </h4>
      </div>
      
      <nav className="p-3">
        <ul className="nav nav-pills flex-column">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name} className="nav-item mb-2">
                <Link
                  href={item.href}
                  className={`nav-link text-white d-flex align-items-center ${
                    isActive ? 'active bg-primary' : 'hover-bg-secondary'
                  }`}
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-auto pt-3 border-top border-secondary sidebar-footer">
          <button 
            onClick={logout}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}