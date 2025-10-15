import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
    User,
    Briefcase,
    FileText,
    Eye,
    Bell,
    Settings,
    LogOut,
    Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface UserProfileSidebarProps {
    userName?: string;
    userTitle?: string;
    userAvatar?: string;
    onLogout?: () => void;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    badge?: number;
    href?: string;
    variant?: 'default' | 'danger';
}

export function UserProfileSidebar({
    userName = 'User',
    userTitle = 'Job Seeker',
    userAvatar,
    onLogout,
}: UserProfileSidebarProps) {
    const [activeItem, setActiveItem] = useState('Thông tin chung');

    const menuItems: MenuItem[] = [
        { label: 'Thông tin chung', icon: <User className="w-4 h-4" /> },
        { label: 'Quản lý Công việc', icon: <Briefcase className="w-4 h-4" /> },
        { label: 'Hồ sơ Ứng tuyển', icon: <FileText className="w-4 h-4" />, badge: 5 },
        { label: 'Xem đánh giá', icon: <Eye className="w-4 h-4" /> },
        { label: 'Thông báo', icon: <Bell className="w-4 h-4" />, badge: 1 },
        { label: 'Cài đặt', icon: <Settings className="w-4 h-4" /> },
    ];

    const handleItemClick = (label: string) => {
        setActiveItem(label);
    };

    return (
        <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
            <div className="p-6 flex flex-col items-center">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                            {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
                    {userName}
                </h2>
                <p className="text-sm text-gray-500">{userTitle}</p>

                <Button variant="default" size="sm" className="mt-2 text-blue-600 h-auto p-0">
                    <Edit className="w-3 h-3 mr-1" />
                    Chỉnh sửa hồ sơ
                </Button>
            </div>

            <Separator />

            <nav className="flex-1 overflow-y-auto py-4">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => handleItemClick(item.label)}
                        className={cn(
                            'w-full flex items-center justify-between px-6 py-3 text-sm transition-colors',
                            activeItem === item.label
                                ? 'bg-green-50 text-green-700 border-r-4 border-green-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                        {item.badge && (
                            <Badge className="bg-blue-600 hover:bg-blue-600 text-white rounded-md px-2 h-5 text-xs">
                                {item.badge}
                            </Badge>
                        )}
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
