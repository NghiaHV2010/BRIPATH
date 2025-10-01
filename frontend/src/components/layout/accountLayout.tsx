import type { ReactNode } from "react";
import Layout from "./layout";
import { NavLink } from "react-router-dom";
import { Settings, User, Briefcase, Bookmark } from "lucide-react";

interface AccountLayoutProps {
  title?: string;
  children: ReactNode;
}

const links = [
  { to: "/settings", label: "Cài đặt", icon: Settings },
  { to: "/profile", label: "Hồ sơ", icon: User },
  { to: "/jobs/applied", label: "Đã ứng tuyển", icon: Briefcase },
  { to: "/jobs/saved", label: "Đã lưu", icon: Bookmark },
];

export default function AccountLayout({ title, children }: AccountLayoutProps) {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <aside className="w-64 hidden md:block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-1">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" /> {l.label}
                  </NavLink>
                );
              })}
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {title}
              </h1>
            )}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
