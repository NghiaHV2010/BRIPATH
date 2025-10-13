import { useEffect, useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import type { Activity } from '../../types/activity';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { getAllActivities } from '@/api';

export function ActivityHistory() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllActivities(page);

            if (response && response?.success) {
                setActivities(response.data);
                setTotalPages(response.totalPages);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch activity history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities(currentPage);
    }, [currentPage]);

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

    const groupActivitiesByDate = () => {
        const grouped: { date: Date; activities: Activity[] }[] = [];

        activities.forEach((activity) => {
            const activityDate = new Date(activity.time);
            const existingGroup = grouped.find((group) =>
                isSameDay(group.date, activityDate)
            );

            if (existingGroup) {
                existingGroup.activities.push(activity);
            } else {
                grouped.push({ date: activityDate, activities: [activity] });
            }
        });

        return grouped;
    };

    if (loading && activities.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6 space-y-4">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const groupedActivities = groupActivitiesByDate();

    return (
        <div className="w-full max-w-4xl mx-auto mt-6 space-y-6">
            <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-gray-700" />
                <h3 className="text-xl font-bold text-gray-900">Lịch sử hoạt động</h3>
            </div>

            {
                activities.length === 0 ? (
                    <Card className="p-12">
                        <div className="text-center">
                            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Không có lịch sử hoạt động</p>
                            <p className="text-gray-400 text-sm mt-1">Các hoạt động của bạn sẽ xuất hiện ở đây</p>
                        </div>
                    </Card>
                ) : (
                    <>
                        <Card className="p-6">
                            <div className="space-y-2">
                                {groupedActivities.map((group) => (
                                    <div key={format(group.date, 'yyyy-MM-dd')}>
                                        {group.activities.map((activity, activityIndex) => (
                                            <ActivityItem
                                                key={activity.id}
                                                activity={activity}
                                                showDate={activityIndex === 0}
                                            />
                                        ))}
                                    </div>
                                ))}
                                <div className="h-px"></div>
                            </div>
                        </Card>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-4">
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
                )
            }
        </div >
    );
}