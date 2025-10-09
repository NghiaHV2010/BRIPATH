import { useState } from "react";
import { Search, MapPin, Building, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CompanyFiltersProps {
  onFilterChange: (filters: CompanyFilterValues) => void;
  isLoading?: boolean;
}

export interface CompanyFilterValues {
  name: string;
  location: string;
  field: string;
}

export function CompanyFilters({ onFilterChange, isLoading = false }: CompanyFiltersProps) {
  const [filters, setFilters] = useState<CompanyFilterValues>({
    name: "",
    location: "",
    field: ""
  });

  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Location options (common Vietnamese cities)
  const locationOptions = [
    { value: "all", label: "Tất cả địa điểm" },
    { value: "Hà Nội", label: "Hà Nội" },
    { value: "Hồ Chí Minh", label: "Hồ Chí Minh" },
    { value: "Đà Nẵng", label: "Đà Nẵng" },
    { value: "Hải Phòng", label: "Hải Phòng" },
    { value: "Cần Thơ", label: "Cần Thơ" },
    { value: "Bình Dương", label: "Bình Dương" },
    { value: "Đồng Nai", label: "Đồng Nai" },
    { value: "Khánh Hòa", label: "Khánh Hòa" }
  ];

  // Field options (company fields)
  const fieldOptions = [
    { value: "all", label: "Tất cả lĩnh vực" },
    { value: "technology", label: "Công nghệ thông tin" },
    { value: "finance", label: "Tài chính - Ngân hàng" },
    { value: "manufacturing", label: "Sản xuất" },
    { value: "retail", label: "Bán lẻ" },
    { value: "healthcare", label: "Y tế - Sức khỏe" },
    { value: "education", label: "Giáo dục - Đào tạo" },
    { value: "construction", label: "Xây dựng" },
    { value: "consulting", label: "Tư vấn" },
    { value: "marketing", label: "Marketing - Quảng cáo" },
    { value: "logistics", label: "Vận tải - Logistics" }
  ];

  const handleFilterChange = (key: keyof CompanyFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const hasFilters = Object.values(newFilters).some(val => val.trim() !== "");
    setHasActiveFilters(hasFilters);
    
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { name: "", location: "", field: "" };
    setFilters(emptyFilters);
    setHasActiveFilters(false);
    onFilterChange(emptyFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by onChange
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(val => val.trim() !== "").length;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Bộ lọc công ty</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {getActiveFilterCount()} bộ lọc
              </Badge>
            )}
          </div>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Search by Company Name */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên công ty..."
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Select 
                value={filters.location} 
                onValueChange={(value) => handleFilterChange("location", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="pl-10 h-11">
                  <SelectValue placeholder="Chọn địa điểm" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {locationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field Filter */}
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Select 
                value={filters.field} 
                onValueChange={(value) => handleFilterChange("field", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="pl-10 h-11">
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {fieldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.name && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Tên: {filters.name}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleFilterChange("name", "")}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Địa điểm: {locationOptions.find(opt => opt.value === filters.location)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleFilterChange("location", "")}
                  />
                </Badge>
              )}
              {filters.field && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  Lĩnh vực: {fieldOptions.find(opt => opt.value === filters.field)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleFilterChange("field", "")}
                  />
                </Badge>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}