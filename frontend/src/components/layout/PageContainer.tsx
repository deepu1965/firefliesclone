"use client";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`px-5 py-5 max-w-5xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
}
