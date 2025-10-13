import type { Activity } from '../../types/activity';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import {
    LogIn,
    LogOut,
    FileText,
    User,
    Settings,
    Activity as ActivityIcon
} from 'lucide-react';

interface ActivityItemProps {
    activity: Activity;
    showDate?: boolean;
}

const getActivityIcon = (activityName: string) => {
    const lowerCase = activityName.toLowerCase();

    if (lowerCase.includes('đăng nhập') || lowerCase.includes('login')) {
        return { Icon: LogIn, color: 'bg-blue-500' };
    }
    if (lowerCase.includes('đăng xuất') || lowerCase.includes('logout')) {
        return { Icon: LogOut, color: 'bg-gray-500' };
    }
    if (lowerCase.includes('cv') || lowerCase.includes('resume') || lowerCase.includes('đăng tải')) {
        return { Icon: FileText, color: 'bg-green-500' };
    }
    if (lowerCase.includes('profile') || lowerCase.includes('hồ sơ')) {
        return { Icon: User, color: 'bg-purple-500' };
    }
    if (lowerCase.includes('settings') || lowerCase.includes('cài đặt')) {
        return { Icon: Settings, color: 'bg-orange-500' };
    }

    return { Icon: ActivityIcon, color: 'bg-blue-500' };
};

export function ActivityItem({ activity, showDate }: ActivityItemProps) {
    const { Icon, color } = getActivityIcon(activity.activity_name);
    const activityDate = new Date(activity.time);

    const getDateLabel = () => {
        if (isToday(activityDate)) {
            return 'Hôm nay';
        }
        if (isYesterday(activityDate)) {
            return 'Hôm qua';
        }
        return format(activityDate, 'MMM dd, yyyy');
    };

    const getTimeLabel = () => {
        console.log(format(activityDate, 'hh:mm a'));

        return format(activityDate, 'hh:mm a');
    };

    return (
        <div className="relative">
            {showDate && (
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm w-fit text-nowrap font-semibold text-gray-900">{getDateLabel()}</h3>
                    <hr className='w-full' />
                </div>
            )}

            <div className="flex gap-4 pb-6 relative">
                <div className="relative flex flex-col items-center">
                    <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center text-white z-10 shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="absolute top-10 bottom-0 w-px bg-gray-200"></div>
                </div>

                <div className="flex-1 pt-1">
                    <p className="text-sm text-gray-900 leading-relaxed mb-1 line-clamp-1">
                        {activity.activity_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{getTimeLabel()}</span>
                        <span>•</span>
                        <span className="text-gray-400">
                            {formatDistanceToNow(activityDate, { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
