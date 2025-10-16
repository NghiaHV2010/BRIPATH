import {
    Settings,
    FileUser,
    Bell,
    Building2,
    Star,
    BriefcaseBusiness,
    User,
    Bookmark,
} from 'lucide-react';

interface CompanyMenuItem {
    label: string;
    icon: React.ReactNode;
    href: string;
    variant?: 'default' | 'danger';
}

interface UserMenuItem {
    label: string;
    icon: React.ReactNode;
    badge?: number;
    href: string;
    variant?: 'default' | 'danger';
}

export const CompanyMenuItems: CompanyMenuItem[] = [
    { label: 'Hồ sơ cá nhân', icon: <Building2 className="w-4 h-4" />, href: '/profile' },
    { label: 'Quản lí công việc', icon: <BriefcaseBusiness className="w-4 h-4" />, href: '/company/profile' },
    { label: 'Hồ sơ ứng tuyển', icon: <FileUser className="w-4 h-4" />, href: '/company/applications' },
    { label: 'Xem đánh giá', icon: <Star className="w-4 h-4" />, href: '/company/saved-jobs' },
    { label: 'Thông báo', icon: <Bell className="w-4 h-4" />, href: '/notifications' },
    { label: 'Cài đặt', icon: <Settings className="w-4 h-4" />, href: '/settings' },
];

export const UserMenuItems: UserMenuItem[] = [
    { label: 'Hồ sơ cá nhân', icon: <User className="w-4 h-4" />, href: '/profile' },
    { label: 'Việc làm phù hợp', icon: <FileUser className="w-4 h-4" />, href: '/cv/suitable' },
    { label: 'Việc làm đã ứng tuyển', icon: <BriefcaseBusiness className="w-4 h-4" />, badge: 5, href: '/jobs/applied' },
    { label: 'Công việc đã lưu', icon: <Bookmark className="w-4 h-4" />, href: '/jobs/saved' },
    { label: 'Thông báo', icon: <Bell className="w-4 h-4" />, badge: 1, href: '/notifications' },
    { label: 'Cài đặt', icon: <Settings className="w-4 h-4" />, href: '/settings' },
];