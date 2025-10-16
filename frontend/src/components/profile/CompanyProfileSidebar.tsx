import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
    Settings,
    FileText,
    Briefcase,
    BookmarkCheck,
    Search,
    Plus,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CompanyProfileSidebarProps {
    companyName?: string;
    industry?: string;
    companyLogo?: string;
    onLogout?: () => void;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    variant?: 'default' | 'danger';
}

export function CompanyProfileSidebar({
    companyName = 'Company',
    industry = 'IT Software | Saas',
    companyLogo,
    onLogout,
}: CompanyProfileSidebarProps) {
    const [activeItem, setActiveItem] = useState('Cài đặt');

    const menuItems: MenuItem[] = [
        { label: 'Cài đặt', icon: <Settings className="w-4 h-4" /> },
        { label: 'Quản lí hồ sơ', icon: <FileText className="w-4 h-4" /> },
        { label: 'Việc làm đã ứng tuyển', icon: <Briefcase className="w-4 h-4" /> },
        { label: 'Việc làm đã lưu', icon: <BookmarkCheck className="w-4 h-4" /> },
        { label: 'Công ty đã lưu', icon: <BookmarkCheck className="w-4 h-4" /> },
        { label: 'Việc làm phù hợp', icon: <Search className="w-4 h-4" /> },
        { label: 'Đăng ký tuyển dụng', icon: <Plus className="w-4 h-4" /> },
    ];

    const handleItemClick = (label: string) => {
        setActiveItem(label);
    };

    return (
        <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 flex flex-col items-center">
                <Avatar className="w-24 h-24 border-4 border-white shadow-md rounded-full">
                    <AvatarImage src={companyLogo} alt={companyName} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 to-blue-500 text-white text-3xl font-bold rounded-full">
                        {companyName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                    {companyName}
                </h2>
                <p className="text-sm text-gray-500 text-center">{industry}</p>

                <Button variant="default" size="sm" className="mt-2 text-blue-600 h-auto p-0">
                    <span className="text-blue-600">✏️</span>
                    <span className="ml-1">Chỉnh sửa hồ sơ</span>
                </Button>
            </div>

            <Separator />

            <nav className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => handleItemClick(item.label)}
                        className={cn(
                            'w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                            activeItem === item.label
                                ? 'bg-gray-50 text-gray-900 font-medium'
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
                    variant="default"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={onLogout}
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
}
