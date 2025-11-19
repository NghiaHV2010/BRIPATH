import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getEventsByUserId, updateEvent, deleteEvent } from "@/api/event_api";
import type { Event as EventType } from "@/api/event_api";
import { useAuthStore } from "@/store/auth";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface MyEvent extends EventType {
  status: "pending" | "approved" | "rejected";
  approved_at?: string | null;
  user_id: string;
}

type EventStatus = "pending" | "approved" | "rejected";

// Helper function to extract error message
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState<EventStatus>("pending");
  const [events, setEvents] = useState<Record<EventStatus, MyEvent[]>>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [isLoading, setIsLoading] = useState<Record<EventStatus, boolean>>({
    pending: true,
    approved: true,
    rejected: true,
  });
  const [currentPage, setCurrentPage] = useState<Record<EventStatus, number>>({
    pending: 1,
    approved: 1,
    rejected: 1,
  });
  const [totalPages, setTotalPages] = useState<Record<EventStatus, number>>({
    pending: 1,
    approved: 1,
    rejected: 1,
  });
  const user = useAuthStore(state => state.authUser);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MyEvent | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    quantity: 0,
    working_time: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEvents = async (status: EventStatus) => {
    if (!user?.id) return;

    try {
      setIsLoading(prev => ({ ...prev, [status]: true }));
      const response = await getEventsByUserId(
        user.id,
        currentPage[status],
        status
      );
      setEvents(prev => ({ ...prev, [status]: response.data as MyEvent[] }));
      setTotalPages(prev => ({ ...prev, [status]: response.totalPages }));
    } catch (error: unknown) {
      console.error(`Error loading ${status} events:`, error);
      const errorMessage = getErrorMessage(
        error,
        "Không thể tải danh sách sự kiện"
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(prev => ({ ...prev, [status]: false }));
    }
  };

  // Load initial data for all tabs when user is available
  useEffect(() => {
    if (user?.id) {
      loadEvents("pending");
      loadEvents("approved");
      loadEvents("rejected");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load data when page changes for current tab
  useEffect(() => {
    if (user?.id && currentPage[activeTab] > 1) {
      loadEvents(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleTabChange = (value: string) => {
    const status = value as EventStatus;
    setActiveTab(status);
  };

  const handlePageChange = (status: EventStatus, newPage: number) => {
    setCurrentPage(prev => ({ ...prev, [status]: newPage }));
  };

  const handleEditClick = (event: MyEvent) => {
    setEditingEvent(event);
    setEditFormData({
      title: event.title,
      description: event.description,
      start_date: event.start_date.split("T")[0],
      end_date: event.end_date.split("T")[0],
      quantity: event.quantity,
      working_time: event.working_time || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent?.id) return;

    try {
      setIsUpdating(true);
      await updateEvent(
        editingEvent.id,
        editFormData.title,
        editFormData.description,
        editFormData.start_date,
        editFormData.end_date,
        editFormData.quantity,
        editFormData.working_time
      );

      toast.success("Cập nhật sự kiện thành công!");
      setEditDialogOpen(false);
      setEditingEvent(null);

      // Reload current tab
      loadEvents(activeTab);
    } catch (error: unknown) {
      console.error("Error updating event:", error);
      const errorMessage = getErrorMessage(
        error,
        "Không thể cập nhật sự kiện. Vui lòng thử lại."
      );
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (eventId: string) => {
    setDeletingEventId(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!deletingEventId) return;

    try {
      setIsDeleting(true);
      await deleteEvent(deletingEventId);

      toast.success("Xóa sự kiện thành công!");
      setDeleteDialogOpen(false);
      setDeletingEventId(null);

      // Reload current tab
      loadEvents(activeTab);
    } catch (error: unknown) {
      console.error("Error deleting event:", error);
      const errorMessage = getErrorMessage(
        error,
        "Không thể xóa sự kiện. Vui lòng thử lại."
      );
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const renderEventList = (status: EventStatus) => {
    const currentEvents = events[status];
    const loading = isLoading[status];
    const currentPageNum = currentPage[status];
    const totalPagesNum = totalPages[status];

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      );
    }

    if (currentEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mb-6 flex justify-center">
            <DotLottieReact
              src="/animations/Bouncy Fail.json"
              loop
              autoplay
              className="w-32 h-32"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có sự kiện
          </h3>
          <p className="text-gray-600">Chưa có sự kiện nào cần xem xét.</p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {currentEvents.map(event => (
            <Card
              key={event.id}
              className="border hover:shadow-lg transition-shadow duration-200"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Banner Image */}
                  {event.banner_url && (
                    <div className="w-full md:w-44 h-32 shrink-0">
                      <img
                        src={event.banner_url}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {event.title}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="custom"
                          onClick={() => handleEditClick(event)}
                          className="shrink-0"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="custom"
                          onClick={() => handleDeleteClick(event.id!)}
                          className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>
                          {formatDate(event.start_date)} -{" "}
                          {formatDate(event.end_date)}
                        </span>
                      </div>

                      {event.working_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>Thời gian làm việc:</span>
                          <span>{event.working_time}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>Số lượng: {event.quantity}</span>
                      </div>

                      {event.approved_at && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Duyệt lúc: {formatDate(event.approved_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Info */}
                    {status === "pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Sự kiện đang chờ duyệt</p>
                          <p className="text-yellow-700">
                            Vui lòng đợi quản trị viên xem xét và phê duyệt sự
                            kiện của bạn.
                          </p>
                        </div>
                      </div>
                    )}

                    {status === "rejected" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">Sự kiện đã bị từ chối</p>
                          <p className="text-red-700">
                            Sự kiện của bạn không được phê duyệt. Vui lòng kiểm
                            tra lại nội dung hoặc liên hệ quản trị viên.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPagesNum > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPageNum > 1 &&
                    handlePageChange(status, currentPageNum - 1)
                  }
                  className={
                    currentPageNum === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* First page */}
              {currentPageNum > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(status, 1)}
                      isActive={currentPageNum === 1}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPageNum > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Pages around current page */}
              {Array.from({ length: totalPagesNum }, (_, i) => i + 1)
                .filter(page => {
                  return (
                    page === currentPageNum ||
                    page === currentPageNum - 1 ||
                    page === currentPageNum + 1 ||
                    (currentPageNum <= 2 && page <= 3) ||
                    (currentPageNum >= totalPagesNum - 1 &&
                      page >= totalPagesNum - 2)
                  );
                })
                .map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(status, page)}
                      isActive={currentPageNum === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* Last page */}
              {currentPageNum < totalPagesNum - 2 && (
                <>
                  {currentPageNum < totalPagesNum - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(status, totalPagesNum)}
                      isActive={currentPageNum === totalPagesNum}
                      className="cursor-pointer"
                    >
                      {totalPagesNum}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPageNum < totalPagesNum &&
                    handlePageChange(status, currentPageNum + 1)
                  }
                  className={
                    currentPageNum === totalPagesNum
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </>
    );
  };

  const getTabCount = (status: EventStatus) => {
    return events[status].length;
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-4 sm:p-6">
      <CardTitle className="text-2xl font-bold text-gray-900 py-10 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Quản lý sự kiện của tôi
      </CardTitle>
      <Card className="border-slate-200 shadow-md">
        <CardHeader>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý các sự kiện bạn đã tạo
          </p>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pending" className="relative">
                Chờ xử lý{" "}
                {getTabCount("pending") > 0 && `(${getTabCount("pending")})`}
              </TabsTrigger>
              <TabsTrigger value="approved" className="relative">
                Chấp nhận{" "}
                {getTabCount("approved") > 0 && `(${getTabCount("approved")})`}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="relative">
                Từ chối{" "}
                {getTabCount("rejected") > 0 && `(${getTabCount("rejected")})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {renderEventList("pending")}
            </TabsContent>

            <TabsContent value="approved">
              {renderEventList("approved")}
            </TabsContent>

            <TabsContent value="rejected">
              {renderEventList("rejected")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Tiêu đề</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={e =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề sự kiện"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Nhập mô tả chi tiết"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Ngày bắt đầu</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      id="edit-start-date"
                      type="text"
                      value={
                        editFormData.start_date
                          ? format(
                              new Date(editFormData.start_date),
                              "dd/MM/yyyy",
                              { locale: vi }
                            )
                          : ""
                      }
                      readOnly
                      placeholder="Chọn ngày bắt đầu"
                      className="cursor-pointer bg-white"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={
                        editFormData.start_date
                          ? new Date(editFormData.start_date)
                          : undefined
                      }
                      onSelect={date => {
                        if (date) {
                          setEditFormData({
                            ...editFormData,
                            start_date: format(date, "yyyy-MM-dd"),
                          });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-end-date">Ngày kết thúc</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      id="edit-end-date"
                      type="text"
                      value={
                        editFormData.end_date
                          ? format(
                              new Date(editFormData.end_date),
                              "dd/MM/yyyy",
                              { locale: vi }
                            )
                          : ""
                      }
                      readOnly
                      placeholder="Chọn ngày kết thúc"
                      className="cursor-pointer bg-white"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={
                        editFormData.end_date
                          ? new Date(editFormData.end_date)
                          : undefined
                      }
                      onSelect={date => {
                        if (date) {
                          setEditFormData({
                            ...editFormData,
                            end_date: format(date, "yyyy-MM-dd"),
                          });
                        }
                      }}
                      disabled={date =>
                        editFormData.start_date
                          ? date < new Date(editFormData.start_date)
                          : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Số lượng</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={editFormData.quantity}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-working-time">Thời gian làm việc</Label>
                <Input
                  id="edit-working-time"
                  value={editFormData.working_time}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      working_time: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: 9:00 AM - 5:00 PM"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateEvent} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sự kiện sẽ bị xóa vĩnh viễn khỏi
              hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
