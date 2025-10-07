import type { ReactNode } from "react";
import Layout from "./layout";

interface AccountLayoutProps {
  title?: string;
  children: ReactNode;
}

export default function AccountLayout({ title, children }: AccountLayoutProps) {
  return (
    <Layout className="!min-h-0" disableAutoScroll={true}>
      <div className="py-6 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </div>
    </Layout>
  );
}
