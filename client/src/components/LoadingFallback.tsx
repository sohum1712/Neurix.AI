import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingFallback = ({ 
  message = "Loading...", 
  fullScreen = false 
}: LoadingFallbackProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0033FF] via-[#0600AB] to-[#00033D] z-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#0033FF] animate-spin mx-auto mb-2" />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export const WidgetLoadingFallback = () => (
  <div className="fixed bottom-12 right-12 z-50">
    <div className="rounded-full w-12 h-12 bg-white shadow-lg flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#0033FF] animate-spin" />
    </div>
  </div>
);
