import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import type { Notification, NotificationType } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
    notification: Notification;
    onRead?: (id: number) => void;
}

const typeColors: Record<NotificationType, string> = {
    system: 'bg-blue-100 text-blue-800 border-blue-200',
    pricing_plan: 'bg-green-100 text-green-800 border-green-200',
    applicant: 'bg-orange-100 text-orange-800 border-orange-200',
    followed: 'bg-pink-100 text-pink-800 border-pink-200',
};

const typeLabels: Record<NotificationType, string> = {
    system: 'Hệ thống',
    pricing_plan: 'Gói thành viên',
    applicant: 'Ứng viên',
    followed: 'Đã theo dõi',
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const handleClick = () => {
        if (!notification.is_read && onRead) {
            onRead(notification.id);
        }
    };

    return (
        <Card
            className={`relative p-4 cursor-pointer transition-colors hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50/30' : 'bg-white'
                }`}
            onClick={() => handleClick()}
        >
            {!notification.is_read && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>
            )}

            <div className="space-y-2">
                <div className="flex items-start justify-between gap-3 pr-4">
                    <h3 className={`font-semibold text-base ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                    </h3>
                    <Badge
                        variant="outline"
                        className={`${typeColors[notification.type]} shrink-0 text-xs`}
                    >
                        {typeLabels[notification.type]}
                    </Badge>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                    {notification.content}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <time>
                        {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}
                    </time>
                    {notification.read_at && (
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            Read {formatDistanceToNow(new Date(notification.read_at), { addSuffix: true })}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
