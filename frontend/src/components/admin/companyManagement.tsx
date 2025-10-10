import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { getCompaniesByStatus, updateCompanyStatus } from "../../api/admin_api";
import { Building2, CheckCircle, XCircle, Eye } from "lucide-react";

interface Company {
  id: string;
  fax_code: string;
  company_type: string;
  status: string;
  created_at: string;
  users: {
    username: string;
    email: string;
    avatar_url?: string;
  };
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCompanies = async (status: 'pending' | 'approved' | 'rejected') => {
    try {
      setLoading(true);
      const response = await getCompaniesByStatus(status);
      setCompanies(response.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(status);
  }, [status]);

  const handleStatusUpdate = async (companyId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(companyId);
      await updateCompanyStatus(companyId, newStatus);
      // Refresh the list
      await fetchCompanies(status);
    } catch (error) {
      console.error("Error updating company status:", error);
    } finally {
      setActionLoading(null);
    }
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
    // This would typically come from a separate API call or be calculated
    return companies.filter(c => c.status === statusType).length;
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
                onClick={() => setStatus(tabStatus)}
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
                {loading ? (
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
                            <p className="font-medium">{company.users.username}</p>
                            <p className="text-sm text-gray-500">{company.users.email}</p>
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
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
