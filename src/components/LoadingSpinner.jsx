import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative inline-flex">
          <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🚌</span>
          </div>
        </div>
        <p className="mt-4 text-white/50 text-sm">{message}</p>
      </div>
    </div>
  );
}
