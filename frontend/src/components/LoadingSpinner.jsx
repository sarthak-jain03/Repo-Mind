import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-zinc-500">
      <Loader2 
        size={sizeMap[size] || sizeMap.md} 
        className="animate-spin mb-4" 
      />
      {message && (
        <p className="text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
