import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { authService } from '../services/authService';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user', error);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0">
            <span className="text-zinc-950 font-bold text-lg">R</span>
          </div>
          <span className="text-lg font-semibold text-white tracking-tight hidden sm:block">RepoMind</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full" />
                ) : (
                  <UserIcon size={14} />
                )}
                <span className="font-medium truncate max-w-[120px]">{user.name || user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-white p-2 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => authService.loginWithGitHub()}
              className="text-sm font-medium text-white hover:text-zinc-300 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
