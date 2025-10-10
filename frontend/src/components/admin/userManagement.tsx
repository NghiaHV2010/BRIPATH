import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Users, Search, Mail, Phone, MapPin, Calendar, Shield, Eye, User, Building } from "lucide-react";
import VisitorChart from "./visitorChart";

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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | null>(null);

  // Mock data - in real app, this would come from an API
  const mockUsers: User[] = [
    {
      id: "1",
      username: "admin_user",
      email: "admin@example.com",
      avatar_url: undefined,
      phone: "0123456789",
      address_street: "123 Main St",
      address_ward: "Ward 1",
      address_city: "Ho Chi Minh City",
      address_country: "Vietnam",
      gender: "Male",
      last_loggedIn: "2024-01-15T10:30:00Z",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      role_id: 3,
      phone_verified: true,
      company_id: undefined
    },
    {
      id: "2",
      username: "company_user",
      email: "company@example.com",
      avatar_url: undefined,
      phone: "0987654321",
      address_street: "456 Business Ave",
      address_ward: "Ward 2",
      address_city: "Hanoi",
      address_country: "Vietnam",
      gender: "Female",
      last_loggedIn: "2024-01-14T15:45:00Z",
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-14T15:45:00Z",
      role_id: 2,
      phone_verified: true,
      company_id: "comp_123"
    },
    {
      id: "3",
      username: "candidate_user",
      email: "candidate@example.com",
      avatar_url: undefined,
      phone: "0555123456",
      address_street: "789 Student St",
      address_ward: "Ward 3",
      address_city: "Da Nang",
      address_country: "Vietnam",
      gender: "Other",
      last_loggedIn: "2024-01-13T09:20:00Z",
      created_at: "2024-01-03T00:00:00Z",
      updated_at: "2024-01-13T09:20:00Z",
      role_id: 1,
      phone_verified: false,
      company_id: undefined
    },
    {
      id: "4",
      username: "john_doe",
      email: "john.doe@email.com",
      avatar_url: undefined,
      phone: "0369852147",
      address_street: "321 Oak Street",
      address_ward: "Ward 4",
      address_city: "Ho Chi Minh City",
      address_country: "Vietnam",
      gender: "Male",
      last_loggedIn: "2024-01-12T14:30:00Z",
      created_at: "2024-01-04T00:00:00Z",
      updated_at: "2024-01-12T14:30:00Z",
      role_id: 1,
      phone_verified: true,
      company_id: undefined
    },
    {
      id: "5",
      username: "jane_smith",
      email: "jane.smith@company.com",
      avatar_url: undefined,
      phone: "0987654321",
      address_street: "654 Pine Avenue",
      address_ward: "Ward 5",
      address_city: "Hanoi",
      address_country: "Vietnam",
      gender: "Female",
      last_loggedIn: "2024-01-11T16:15:00Z",
      created_at: "2024-01-05T00:00:00Z",
      updated_at: "2024-01-11T16:15:00Z",
      role_id: 2,
      phone_verified: true,
      company_id: "comp_456"
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // In real app: const response = await getUsers();
        // setUsers(response.data);
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    // Filter by role
    if (roleFilter !== null) {
      filtered = filtered.filter(user => user.role_id === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);


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
        <VisitorChart title="Total Users" subtitle="User growth over time" />
        <VisitorChart title="User Activity" subtitle="Active users by period" />
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
              <Button
                variant={roleFilter === 3 ? "default" : "outline"}
                onClick={() => setRoleFilter(3)}
                size="sm"
              >
                Admin
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
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
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

          {/* Summary Stats */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                    <p className="text-2xl font-bold">{users.length}</p>
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
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role_id === 1).length}
                    </p>
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
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role_id === 2).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admin</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role_id === 3).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
