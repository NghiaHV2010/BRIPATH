import type { ReactNode } from "react";

interface AccountLayoutProps {
  title?: string;
  children: ReactNode;
}

export default function AccountLayout({ title, children }: AccountLayoutProps) {
  return (
    <div className="py-6 max-w-5xl w-full pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
