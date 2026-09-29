import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';


export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      authService.saveToken(token);
      navigate('/dashboard', { replace: true });
    } else {
      console.error('No token received from OAuth callback');
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animated-bg" />
      <LoadingSpinner message="Completing sign in..." size="lg" />
    </div>
  );
}
