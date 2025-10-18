import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { createJobLabel, createCompanyLabel, getAllJobLabels, getAllCompanyLabels } from "../../api/admin_api";
import { Plus, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface JobLabel {
  id: string;
  label_name: string;
}

interface CompanyLabel {
  id: string;
  label_name: string;
}

export default function LabelManagement() {
  const [jobLabels, setJobLabels] = useState<JobLabel[]>([]);
  const [companyLabels, setCompanyLabels] = useState<CompanyLabel[]>([]);
  const [newJobLabel, setNewJobLabel] = useState("");
  const [newCompanyLabel, setNewCompanyLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLabels = async () => {
    try {
      const [jobLabelsResponse, companyLabelsResponse] = await Promise.all([
        getAllJobLabels(),
        getAllCompanyLabels()
      ]);
      
      setJobLabels(jobLabelsResponse.data || []);
      setCompanyLabels(companyLabelsResponse.data || []);
    } catch (error) {
      console.error("Error fetching labels:", error);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  const handleCreateJobLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobLabel.trim()) {
      toast.error("Vui lòng nhập tên nhãn công việc");
      return;
    }

    try {
      setLoading(true);
      await createJobLabel(newJobLabel.trim());
      toast.success("Tạo nhãn công việc thành công");
      setNewJobLabel("");
      // Refresh job labels
      await fetchLabels();
    } catch (error) {
      console.error("Error creating job label:", error);
      toast.error("Tạo nhãn công việc thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompanyLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyLabel.trim()) {
      toast.error("Vui lòng nhập tên nhãn công ty");
      return;
    }

    try {
      setLoading(true);
      await createCompanyLabel(newCompanyLabel.trim());
      toast.success("Tạo nhãn công ty thành công");
      setNewCompanyLabel("");
      // Refresh company labels
      await fetchLabels();
    } catch (error) {
      console.error("Error creating company label:", error);
      toast.error("Tạo nhãn công ty thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Labels Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Quản lý nhãn công việc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateJobLabel} className="flex gap-2 mb-4">
            <Input
              placeholder="Nhập tên nhãn công việc..."
              value={newJobLabel}
              onChange={(e) => setNewJobLabel(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm nhãn
            </Button>
          </form>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên nhãn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobLabels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      Chưa có nhãn công việc nào
                    </TableCell>
                  </TableRow>
                ) : (
                  jobLabels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell className="font-mono text-sm">{label.id}</TableCell>
                      <TableCell className="font-medium">{label.label_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Hoạt động</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Company Labels Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Quản lý nhãn công ty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCompanyLabel} className="flex gap-2 mb-4">
            <Input
              placeholder="Nhập tên nhãn công ty..."
              value={newCompanyLabel}
              onChange={(e) => setNewCompanyLabel(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm nhãn
            </Button>
          </form>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên nhãn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyLabels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      Chưa có nhãn công ty nào
                    </TableCell>
                  </TableRow>
                ) : (
                  companyLabels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell className="font-mono text-sm">{label.id}</TableCell>
                      <TableCell className="font-medium">{label.label_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Hoạt động</Badge>
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
