import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Building2, MapPin, Users, Star } from "lucide-react";
import { getFollowedCompanies } from "@/api/user_api";
import { useCompanyStore } from "@/store/company.store";

interface FollowedCompany {
  id: string;
  users?: {
    username: string;
    avatar_url?: string;
    address_city?: string;
  };
  _count?: {
    jobs?: number;
    followedCompanies?: number;
  };
  is_verified?: boolean;
}

export default function FollowedCompanies() {
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { unfollowCompany } = useCompanyStore();

  useEffect(() => {
    loadFollowedCompanies();
  }, []);

  const loadFollowedCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await getFollowedCompanies();
      if (response.success) {
        setFollowedCompanies(response.data);
      }
    } catch (error) {
      console.error("Error loading followed companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (companyId: string) => {
    try {
      await unfollowCompany(companyId);
      // Reload the list after unfollowing
      loadFollowedCompanies();
    } catch (error) {
      console.error("Error unfollowing company:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Công ty đang theo dõi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (followedCompanies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Công ty đang theo dõi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa theo dõi công ty nào
            </h3>
            <p className="text-gray-500 mb-4">
              Hãy khám phá và theo dõi các công ty bạn quan tâm
            </p>
            <Button asChild>
              <Link to="/companies">Khám phá công ty</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Công ty đang theo dõi ({followedCompanies.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {followedCompanies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {company.users?.avatar_url ? (
                    <img
                      src={company.users.avatar_url}
                      alt={company.users.username}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {company.users?.username}
                    </h3>
                    {company.is_verified && (
                      <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {company.users?.address_city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {company.users.address_city}
                      </div>
                    )}
                    {company._count?.jobs && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {company._count.jobs} vị trí
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/companies/${company.id}`}>
                    Xem chi tiết
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfollow(company.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Bỏ theo dõi
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
