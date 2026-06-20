import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginPage from './LoginPage';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return <>{children}</>;
}
