import { Metadata } from 'next';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminLogin from '@/components/admin/AdminLogin';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin panel for e-commerce management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      fallback={<AdminLogin />} // Show login when not authenticated
    >
      <div className="d-flex vh-100">
        <AdminSidebar />
        <div className="flex-grow-1 d-flex flex-column">
          <AdminHeader />
          <main className="flex-grow-1 p-4 bg-light overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}