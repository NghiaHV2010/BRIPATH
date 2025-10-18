import { useEffect, useState } from 'react';
import { NotificationItem } from './NotificationItem';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import type { Notification } from '../../types/notification';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { getAllNotifications, markNotificationAsRead } from '@/api';

export function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllNotifications(page);

            if (response && response.success) {
                setNotifications(response.data);
                setTotalPages(response.totalPages || 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [currentPage]);

    const handleMarkAsRead = async (id: number) => {
        const response = await markNotificationAsRead(id);
        if (response && response.success) {
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id
                        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                        : notif
                )
            );
        } else {
            alert('Failed to mark notification as read');
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="w-full max-w-5xl mx-auto p-6 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-5xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl h-screen p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-500 rounded-md">
                        <Bell className="size-8 text-gray-200 " />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Thông báo</h3>
                </div>
                <div className="text-sm text-gray-500">
                    {notifications.filter((n) => !n.is_read).length} chưa đọc
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có thông báo nào!</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={handleMarkAsRead}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1 || loading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Trước
                            </Button>

                            <span className="text-sm text-gray-600">
                                Trang {currentPage} / {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || loading}
                            >
                                Tiếp
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
