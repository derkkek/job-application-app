import { Suspense } from "react";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuspenseWrapper({ 
  children, 
  fallback = <LoadingSpinner size="lg" className="py-8" />
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
} 