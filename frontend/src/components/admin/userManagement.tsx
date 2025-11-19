import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Users, Search, Mail, Phone, MapPin, Calendar, Shield, Eye, User, Building, ChevronLeft, ChevronRight } from "lucide-react";
import VisitorChart from "./visitorChart";
import { getAllUsers } from "../../api/admin_api";
import { AdminTableSkeleton } from "./AdminTableSkeleton";
import { AdminEmptyState } from "./AdminEmptyState";

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  address_street?: string;
  address_ward?: string;
  address_city?: string;
  address_country?: string;
  gender?: string;
  last_loggedIn?: string;
  created_at: string;
  updated_at: string;
  role_id: number;
  phone_verified: boolean;
  company_id?: string;
}

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRoleBadge = (roleId: number) => {
  switch (roleId) {
    case 1:
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Ứng viên</Badge>;
    case 2:
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Công ty</Badge>;
    case 3:
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Admin</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// User Detail Modal Component
function UserDetailModal({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết người dùng
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* User Avatar & Basic Info */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.username}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-4 w-4 text-gray-500" />
                {getRoleBadge(user.role_id)}
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Thông tin liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.phone || "Chưa cập nhật"}</span>
                  {user.phone_verified && (
                    <Badge variant="outline" className="text-xs">Đã xác thực</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.gender && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm capitalize">{user.gender}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.address_street && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{user.address_street}</span>
                  </div>
                )}
                {(user.address_ward || user.address_city) && (
                  <div className="text-sm text-gray-600">
                    {[user.address_ward, user.address_city].filter(Boolean).join(', ')}
                  </div>
                )}
                {user.address_country && (
                  <div className="text-sm text-gray-600">{user.address_country}</div>
                )}
              </CardContent>
            </Card>

            {/* Activity Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Đăng nhập cuối: {user.last_loggedIn ? formatDate(user.last_loggedIn) : "Chưa đăng nhập"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Tham gia: {formatDate(user.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Cập nhật: {formatDate(user.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Company Information (if applicable) */}
            {user.role_id === 2 && user.company_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Công ty
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">ID: {user.company_id}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleCounts, setRoleCounts] = useState({
    all: 0,
    candidate: 0,
    company: 0,
    admin: 0
  });

  const fetchUsers = async (page: number = 1, search?: string, roleId?: number | null) => {
    try {
      setLoading(true);
      const response = await getAllUsers(page, search, roleId);
      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
      setTotalUsers(response.totalUsers || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleCounts = async () => {
    try {
      const [allResponse, candidateResponse, companyResponse] = await Promise.all([
        getAllUsers(1),
        getAllUsers(1, undefined, 1),
        getAllUsers(1, undefined, 2)
      ]);

      setRoleCounts({
        all: allResponse.totalUsers || 0,
        candidate: candidateResponse.totalUsers || 0,
        company: companyResponse.totalUsers || 0,
        admin: 0
      });
    } catch (error) {
      console.error("Error fetching role counts:", error);
    }
  };

  useEffect(() => {
    fetchRoleCounts();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, searchTerm || undefined, roleFilter);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm || undefined, roleFilter);
  };


  const getStatusColor = (lastLoggedIn?: string) => {
    if (!lastLoggedIn) return 'text-gray-500';
    
    const lastLogin = new Date(lastLoggedIn);
    const now = new Date();
    const diffInHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) return 'text-green-600';
    if (diffInHours < 168) return 'text-yellow-600'; // 7 days
    return 'text-red-600';
  };

  const getStatusText = (lastLoggedIn?: string) => {
    if (!lastLoggedIn) return 'Chưa đăng nhập';
    
    const lastLogin = new Date(lastLoggedIn);
    const now = new Date();
    const diffInHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Vừa hoạt động';
    if (diffInHours < 24) return 'Hoạt động hôm nay';
    if (diffInHours < 168) return 'Hoạt động tuần này';
    return 'Hoạt động lâu';
  };

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VisitorChart title="Tổng số người dùng" subtitle="Tăng trưởng người dùng theo thời gian" />
        <VisitorChart title="Hoạt động người dùng" subtitle="Mức độ hoạt động theo từng giai đoạn" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === null ? "default" : "outline"}
                onClick={() => setRoleFilter(null)}
                size="sm"
              >
                Tất cả
              </Button>
              <Button
                variant={roleFilter === 1 ? "default" : "outline"}
                onClick={() => setRoleFilter(1)}
                size="sm"
              >
                Ứng viên
              </Button>
              <Button
                variant={roleFilter === 2 ? "default" : "outline"}
                onClick={() => setRoleFilter(2)}
                size="sm"
              >
                Công ty
              </Button>
            </div>
          </div>

          {/* Users Table - Simplified */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminTableSkeleton columns={6} rows={6} />
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <AdminEmptyState
                        icon={Users}
                        title="Không tìm thấy người dùng"
                        description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm kết quả."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{user.username}</p>
                            {user.phone && (
                              <p className="text-sm text-gray-500">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role_id)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${getStatusColor(user.last_loggedIn)}`}>
                          {getStatusText(user.last_loggedIn)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                      </TableCell>
                      <TableCell>
                        <UserDetailModal user={user}>
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                          </Button>
                        </UserDetailModal>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages} (Tổng: {totalUsers} người dùng)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>

                {/* Page numbers */}
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
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                    <p className="text-2xl font-bold">{roleCounts.all}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ứng viên</p>
                    <p className="text-2xl font-bold">{roleCounts.candidate}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Công ty</p>
                    <p className="text-2xl font-bold">{roleCounts.company}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
