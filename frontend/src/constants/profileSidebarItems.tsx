import {
    Settings,
    FileUser,
    Bell,
    Building2,
    Star,
    BriefcaseBusiness,
    User,
    Bookmark,
    UserRoundCheck,
    ChartCandlestick,
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
    { label: 'Quản lí công việc', icon: <BriefcaseBusiness className="w-4 h-4" />, href: '/profile/jobs' },
    { label: 'Hồ sơ ứng tuyển', icon: <FileUser className="w-4 h-4" />, href: '/profile/applications' },
    { label: 'Xem đánh giá', icon: <Star className="w-4 h-4" />, href: '/profile/reviews' },
    { label: 'Gói đăng ký', icon: <ChartCandlestick className="w-4 h-4" />, href: '/profile/subscriptions' },
    { label: 'Thông báo', icon: <Bell className="w-4 h-4" />, href: '/profile/notifications' },
    { label: 'Cài đặt', icon: <Settings className="w-4 h-4" />, href: '/profile/settings' },
];

export const UserMenuItems: UserMenuItem[] = [
    { label: 'Hồ sơ cá nhân', icon: <User className="w-4 h-4" />, href: '/profile' },
    { label: 'Việc làm phù hợp', icon: <FileUser className="w-4 h-4" />, href: '/profile/suitable/jobs' },
    { label: 'Việc làm đã ứng tuyển', icon: <BriefcaseBusiness className="w-4 h-4" />, badge: 5, href: '/profile/applied/jobs' },
    { label: 'Công việc đã lưu', icon: <Bookmark className="w-4 h-4" />, href: '/profile/saved/jobs' },
    { label: 'Công ty đã theo dõi', icon: <UserRoundCheck className="w-4 h-4" />, href: '/profile/followed/companies' },
    { label: 'Gói đăng ký', icon: <ChartCandlestick className="w-4 h-4" />, href: '/profile/subscriptions' },
    { label: 'Thông báo', icon: <Bell className="w-4 h-4" />, badge: 1, href: '/profile/notifications' },
    { label: 'Cài đặt', icon: <Settings className="w-4 h-4" />, href: '/profile/settings' },
];