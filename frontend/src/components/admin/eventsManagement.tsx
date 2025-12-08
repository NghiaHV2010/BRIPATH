import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { getEventsByStatus, updateEventStatus } from "../../api/admin_api";
import { Calendar, CheckCircle, XCircle, Eye, MapPin, Clock, ChevronLeft, ChevronRight, User, X, Image as ImageIcon } from "lucide-react";
import { AdminTableSkeleton } from "./AdminTableSkeleton";
import { AdminEmptyState } from "./AdminEmptyState";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  banner_url: string;
  users: {
    username: string;
    email: string;
    avatar_url?: string;
  };
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const itemsPerPage = 10;

  const fetchAllEventsAndCounts = async () => {
    try {
      const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        getEventsByStatus('pending'),
        getEventsByStatus('approved'),
        getEventsByStatus('rejected'),
      ]);

      const pendingEvents = pendingResponse.data || [];
      const approvedEvents = approvedResponse.data || [];
      const rejectedEvents = rejectedResponse.data || [];

      setStatusCounts({
        pending: pendingEvents.length,
        approved: approvedEvents.length,
        rejected: rejectedEvents.length,
      });

      return [...pendingEvents, ...approvedEvents, ...rejectedEvents];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  };

  const fetchEvents = async (statusType: 'pending' | 'approved' | 'rejected', page: number = 1) => {
    try {
      setLoading(true);
      const allEvents = await fetchAllEventsAndCounts();

      const filteredEvents = allEvents.filter(event => event.status === statusType);

      const totalItems = filteredEvents.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

      setEvents(paginatedEvents);
      setTotalPages(totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(status, 1);
  }, [status]);

  const handleStatusUpdate = async (eventId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(eventId);
      await updateEventStatus(eventId, newStatus);
      await fetchEvents(status, currentPage);
    } catch (error) {
      console.error("Error updating event status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEvents(status, page);
  };

  const handleStatusChange = (newStatus: 'pending' | 'approved' | 'rejected') => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusCount = (statusType: string) => {
    return statusCounts[statusType as keyof typeof statusCounts] || 0;
  };

  const getStatusLabel = (statusType: 'pending' | 'approved' | 'rejected') => {
    switch (statusType) {
      case 'pending':
        return 'chờ duyệt';
      case 'approved':
        return 'đã duyệt';
      case 'rejected':
        return 'từ chối';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id} className="mb-4">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            {getStatusBadge(event.status)}
          </div>
          <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
        </div>

        {/* Banner Image - Moved below description */}
        {event.banner_url && (
          <button
            onClick={() => handleImageClick(event.banner_url)}
            className="w-full cursor-pointer"
          >
            <img
              src={event.banner_url}
              alt={event.title}
              className="w-full h-40 object-cover rounded-md hover:opacity-90 transition-opacity"
            />
          </button>
        )}

        {/* Details */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700">{event.location}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="text-sm text-gray-700">Bắt đầu: {formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="text-sm text-gray-700">Kết thúc: {formatDate(event.end_date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {event.users.avatar_url ? (
              <img
                loading="lazy"
                src={event.users.avatar_url}
                alt={event.users.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-gray-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{event.users.username}</p>
              <p className="text-xs text-gray-500 truncate">{event.users.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-700">Ngày tạo: {new Date(event.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {event.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-green-600 hover:text-green-700"
                onClick={() => handleStatusUpdate(event.id, 'approved')}
                disabled={actionLoading === event.id}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={() => handleStatusUpdate(event.id, 'rejected')}
                disabled={actionLoading === event.id}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Từ chối
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => handleViewEvent(event)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quản lý sự kiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Responsive Status Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {(['pending', 'approved', 'rejected'] as const).map((tabStatus) => (
              <Button
                key={tabStatus}
                variant={status === tabStatus ? "default" : "outline"}
                onClick={() => handleStatusChange(tabStatus)}
                className="w-full justify-between"
              >
                <span>
                  {tabStatus === 'pending' && 'Chờ duyệt'}
                  {tabStatus === 'approved' && 'Đã duyệt'}
                  {tabStatus === 'rejected' && 'Từ chối'}
                </span>
                <Badge
                  variant="secondary"
                  className={status === tabStatus ? "bg-white/20" : ""}
                >
                  {getStatusCount(tabStatus)}
                </Badge>
              </Button>
            ))}
          </div>

          {loading ? (
            // Wrap skeleton in proper table structure
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sự kiện</TableHead>
                    <TableHead>Banner</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Người tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AdminTableSkeleton columns={8} rows={5} />
                </TableBody>
              </Table>
            </div>
          ) : events.length === 0 ? (
            <AdminEmptyState
              icon={Calendar}
              title="Chưa có sự kiện nào"
              description={`Danh sách sự kiện ${getStatusLabel(status)} hiện đang trống.`}
            />
          ) : (
            <>
              {/* Mobile/Tablet Card View */}
              <div className="block lg:hidden">
                {events.map((event) => renderEventCard(event))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sự kiện</TableHead>
                      <TableHead>Banner</TableHead>
                      <TableHead>Địa điểm</TableHead>
                      <TableHead className="whitespace-nowrap">Thời gian</TableHead>
                      <TableHead className="whitespace-nowrap">Người tạo</TableHead>
                      <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                      <TableHead className="whitespace-nowrap">Ngày tạo</TableHead>
                      <TableHead className="whitespace-nowrap">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        {/* Event Info Cell */}
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="w-40">
                          {event.banner_url ? (
                            <button
                              onClick={() => handleImageClick(event.banner_url)}
                              className="cursor-pointer w-40"
                            >
                              <img
                                loading="lazy"
                                src={event.banner_url}
                                alt={event.title}
                                className="w-full h-24 object-cover rounded-md hover:opacity-90 transition-opacity"
                              />
                            </button>
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                <p className="hidden xl:block">Bắt đầu: </p>
                                <p className="italic">{formatDate(event.start_date)}</p>
                              </span>
                            </div>
                            <span className="block xl:hidden">-</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                <p className="hidden xl:block">Kết thúc: </p>
                                <p className="italic">{formatDate(event.end_date)}</p>
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {event.users.avatar_url ? (
                                <img
                                  loading="lazy"
                                  src={event.users.avatar_url}
                                  alt={event.users.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (<User className="h-5 w-5 text-blue-600" />)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{event.users.username}</p>
                              <p className="text-xs text-gray-500">{event.users.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getStatusBadge(event.status)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {event.created_at}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {event.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleStatusUpdate(event.id, 'approved')}
                                  disabled={actionLoading === event.id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Duyệt
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleStatusUpdate(event.id, 'rejected')}
                                  disabled={actionLoading === event.id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Từ chối
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewEvent(event)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Trước</span>
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline mr-1">Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Chi tiết sự kiện
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và quản lý trạng thái sự kiện
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                  {getStatusBadge(selectedEvent.status)}
                </div>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              {/* Event Banner - Moved below description */}
              {selectedEvent.banner_url && (
                <button
                  onClick={() => handleImageClick(selectedEvent.banner_url)}
                  className="w-full cursor-pointer rounded-lg overflow-hidden"
                >
                  <img
                    src={selectedEvent.banner_url}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                  />
                </button>
              )}

              {/* Event Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Location & Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa điểm & Thời gian
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Địa điểm</p>
                      <p className="text-sm">{selectedEvent.location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Thời gian bắt đầu</p>
                      <p className="text-sm">{formatDate(selectedEvent.start_date)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Thời gian kết thúc</p>
                      <p className="text-sm">{formatDate(selectedEvent.end_date)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Creator Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Người tạo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedEvent.users.username}</p>
                        <p className="text-sm text-gray-500">{selectedEvent.users.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Ngày tạo</p>
                      <p className="text-sm">{new Date(selectedEvent.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              {selectedEvent.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                    onClick={async () => {
                      await handleStatusUpdate(selectedEvent.id, 'approved');
                      setIsModalOpen(false);
                    }}
                    disabled={actionLoading === selectedEvent.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Duyệt sự kiện
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={async () => {
                      await handleStatusUpdate(selectedEvent.id, 'rejected');
                      setIsModalOpen(false);
                    }}
                    disabled={actionLoading === selectedEvent.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Từ chối
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Event Banner Full View"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
