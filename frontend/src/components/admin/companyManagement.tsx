import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { getCompaniesByStatus, updateCompanyStatus } from "../../api/admin_api";
import { Building2, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";

interface Company {
  id: string;
  fax_code: string;
  company_type: string;
  status: string;
  created_at: string;
  business_certificate?: string;
  field?: string;
  approved_at?: string;
  users: {
    username: string;
    email: string;
    avatar_url?: string;
    address_street?: string;
    address_ward?: string;
    address_city?: string;
    address_country?: string;
    phone?: string;
  };
  companyLabels?: Array<{ label_name: string }>;
  fields?: Array<{ field_name: string }>;
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const fetchAllCompaniesAndCounts = async () => {
    try {
      // Fetch all companies for all statuses to get accurate counts
      const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        getCompaniesByStatus('pending'),
        getCompaniesByStatus('approved'),
        getCompaniesByStatus('rejected')
      ]);

      const pendingCompanies = pendingResponse.data || [];
      const approvedCompanies = approvedResponse.data || [];
      const rejectedCompanies = rejectedResponse.data || [];

      // Update status counts
      setStatusCounts({
        pending: pendingCompanies.length,
        approved: approvedCompanies.length,
        rejected: rejectedCompanies.length
      });

      // Return all companies (filtering will be done in fetchCompanies)
      return [...pendingCompanies, ...approvedCompanies, ...rejectedCompanies];
    } catch (error) {
      console.error("Error fetching companies:", error);
      return [];
    }
  };

  const fetchCompanies = async (statusType: 'pending' | 'approved' | 'rejected', page: number = 1) => {
    try {
      setLoading(true);
      const allCompanies = await fetchAllCompaniesAndCounts();

      // Filter companies by status type
      const filteredCompanies = allCompanies.filter(company => company.status === statusType);

      // Calculate pagination
      const totalItems = filteredCompanies.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

      setCompanies(paginatedCompanies);
      setTotalPages(totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(status, 1);
  }, [status]);

  const handleStatusUpdate = async (companyId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(companyId);
      await updateCompanyStatus(companyId, newStatus);
      // Refresh the list
      await fetchCompanies(status, currentPage);
    } catch (error) {
      console.error("Error updating company status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCompanies(status, page);
  };

  const handleStatusChange = (newStatus: 'pending' | 'approved' | 'rejected') => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Quản lý công ty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            {(['pending', 'approved', 'rejected'] as const).map((tabStatus) => (
              <Button
                key={tabStatus}
                variant={status === tabStatus ? "default" : "outline"}
                onClick={() => handleStatusChange(tabStatus)}
                className="capitalize"
              >
                {tabStatus === 'pending' && 'Chờ duyệt'}
                {tabStatus === 'approved' && 'Đã duyệt'}
                {tabStatus === 'rejected' && 'Từ chối'}
                <Badge variant="secondary" className="ml-2">
                  {getStatusCount(tabStatus)}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Companies Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Công ty</TableHead>
                  <TableHead>Mã số thuế</TableHead>
                  <TableHead>Loại hình</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies && loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không có công ty nào
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{company.users?.username}</p>
                            <p className="text-sm text-gray-500">{company.users?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {company.fax_code}
                      </TableCell>
                      <TableCell>{company.company_type}</TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {company.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusUpdate(company.id, 'approved')}
                                disabled={actionLoading === company.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusUpdate(company.id, 'rejected')}
                                disabled={actionLoading === company.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                            </>
                          )}
                          <Dialog open={isModalOpen && selectedCompany?.id === company.id} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCompany(company)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Xem chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Building2 className="h-5 w-5" />
                                  Chi tiết công ty
                                </DialogTitle>
                              </DialogHeader>
                              {selectedCompany && (
                                <div className="space-y-6">
                                  {/* Company Avatar & Basic Info */}
                                  <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                      <Building2 className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-xl font-semibold">{selectedCompany.users?.username}</h3>
                                      <p className="text-gray-600">{selectedCompany.users?.email}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Building2 className="h-4 w-4 text-gray-500" />
                                        {getStatusBadge(selectedCompany.status)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detailed Information Grid */}
                                  <div className="grid gap-4 md:grid-cols-2">

                                    {/* Company Information */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <Building2 className="h-4 w-4" />
                                          Thông tin công ty
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Building2 className="h-4 w-4 text-gray-500" />
                                          <span className="text-sm">{selectedCompany.company_type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-mono">{selectedCompany.fax_code}</span>
                                        </div>
                                        {selectedCompany.business_certificate && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm break-all">{selectedCompany.business_certificate}</span>
                                          </div>
                                        )}
                                        {selectedCompany.users.phone && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">{selectedCompany.users.phone}</span>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {/* Address Information */}
                                    {(selectedCompany.users.address_street || selectedCompany.users.address_city) && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Địa chỉ
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <p className="text-sm">
                                            {selectedCompany.users.address_street && `${selectedCompany.users.address_street}, `}
                                            {selectedCompany.users.address_ward && `${selectedCompany.users.address_ward}, `}
                                            {selectedCompany.users.address_city && `${selectedCompany.users.address_city}, `}
                                            {selectedCompany.users.address_country && selectedCompany.users.address_country}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Labels */}
                                    {selectedCompany.companyLabels && selectedCompany.companyLabels.length > 0 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Badge className="h-4 w-4" />
                                            Nhãn công ty
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedCompany.companyLabels.map((label, index) => (
                                              <Badge key={index} variant="secondary">
                                                {label.label_name}
                                              </Badge>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Fields */}
                                    {selectedCompany.fields && selectedCompany.fields.length > 0 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Lĩnh vực hoạt động
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedCompany.fields.map((field, index) => (
                                              <Badge key={index} variant="outline">
                                                {field.field_name}
                                              </Badge>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Timeline Information */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                          <Calendar className="h-4 w-4" />
                                          Thời gian
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-gray-500" />
                                          <span className="text-sm">Đăng ký: {new Date(selectedCompany.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        {selectedCompany.approved_at && (
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">Duyệt: {new Date(selectedCompany.approved_at).toLocaleDateString('vi-VN')}</span>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Actions */}
                                  {selectedCompany.status === 'pending' && (
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700"
                                        onClick={async () => {
                                          await handleStatusUpdate(selectedCompany.id, 'approved');
                                          setIsModalOpen(false);
                                        }}
                                        disabled={actionLoading === selectedCompany.id}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Duyệt công ty
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={async () => {
                                          await handleStatusUpdate(selectedCompany.id, 'rejected');
                                          setIsModalOpen(false);
                                        }}
                                        disabled={actionLoading === selectedCompany.id}
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
                        </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
