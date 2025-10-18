import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Edit, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface CompanyProfileSidebarProps {
    username?: string;
    role?: string;
    avatar?: string;
    navitems?: {
        label: string;
        icon: React.ReactNode;
        href: string;
    }[];
    onLogout?: () => void;
}

export function ProfileSidebar({
    username = 'Company',
    role = 'Company',
    avatar,
    navitems,
    onLogout,
}: CompanyProfileSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleItemClick = (href: string) => {
        navigate(href);
    };

    const isActiveItem = (href: string) => {
        return location.pathname === href;
    };

    return (
        <div className="max-w-64 max-h-[80vh] bg-white border rounded-xl border-gray-200 flex flex-col flex-1 mt-6 sticky top-0 left-0 shadow-sm">
            <div className="p-6 flex flex-col items-center">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4  shadow-md rounded-full">
                        {avatar ? (
                            <AvatarImage src={avatar} alt={username} />
                        ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                                {username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <Button
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                    {username}
                </h2>
                <p className="text-sm text-gray-500 text-center">{role}</p>

                <Button variant="custom" size="default" className="mt-2 text-blue-600 h-auto p-0 hover:scale-none cursor-pointer">
                    Chỉnh sửa hồ sơ
                </Button>
            </div>

            <Separator />

            <nav className="flex-1 overflow-y-auto py-4">
                {navitems?.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => handleItemClick(item.href)}
                        className={cn(
                            'w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                            isActiveItem(item.href)
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                        )}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <Separator />

            <div className="p-4">
                <Button
                    variant="custom"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-none"
                    onClick={onLogout}
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
}
