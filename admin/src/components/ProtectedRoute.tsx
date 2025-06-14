'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'user' | 'admin' | 'both';
  requiredAdminLevel?: string[];
  fallback?: React.ReactNode; // Add fallback prop
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredType = 'both',
  requiredAdminLevel = [],
  fallback = null,
  redirectTo
}: ProtectedRouteProps) {
  const { user, userType, loading, isAdmin, isUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && redirectTo) {
      router.push(redirectTo);
      return;
    }

    if (!loading && user) {
      // Check user type requirements
      if (requiredType === 'admin' && !isAdmin) {
        if (redirectTo) {
          router.push('/unauthorized');
        }
        return;
      }

      if (requiredType === 'user' && !isUser) {
        if (redirectTo) {
          router.push('/unauthorized');
        }
        return;
      }

      // Check admin level requirements
      if (isAdmin && requiredAdminLevel.length > 0) {
        const admin = user as any;
        if (!requiredAdminLevel.includes(admin.adminLevel)) {
          if (redirectTo) {
            router.push('/unauthorized');
          }
          return;
        }
      }
    }
  }, [user, userType, loading, isAdmin, isUser, router, requiredType, requiredAdminLevel, redirectTo]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and fallback is provided, show fallback
  if (!user && fallback) {
    return <>{fallback}</>;
  }

  // If not authenticated and no fallback, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  // Check user type requirements for rendering
  if (requiredType === 'admin' && !isAdmin) {
    return fallback ? <>{fallback}</> : null;
  }

  if (requiredType === 'user' && !isUser) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check admin level requirements for rendering
  if (isAdmin && requiredAdminLevel.length > 0) {
    const admin = user as any;
    if (!requiredAdminLevel.includes(admin.adminLevel)) {
      return fallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
}