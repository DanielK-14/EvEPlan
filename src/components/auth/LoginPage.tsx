import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        <div className="text-5xl">🎉</div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">מתכנן אירועים</h1>
          <p className="text-gray-500 text-sm">פלטפורמת ניהול אירועים ותקציב בזמן אמת</p>
        </div>
        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          <LogIn size={18} />
          התחבר עם Google
        </button>
      </div>
    </div>
  );
}
