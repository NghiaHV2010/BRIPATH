import { useAuthStore } from "../../store/auth";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function DemoAdminAccess() {
  const { authUser } = useAuthStore();

  // Demo function to show admin access info
  const isAdmin = authUser?.role_id === 3;
  const isCompany = authUser?.role_id === 2;
  const isUser = authUser?.role_id === 1;

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Admin Access Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>User ID:</strong> {authUser?.id}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Username:</strong> {authUser?.username}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {authUser?.email}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Role ID:</strong> {authUser?.role_id}
          </p>
        </div>

        <div className="space-y-2">
          <div className={`p-2 rounded ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            <strong>Admin Access:</strong> {isAdmin ? '✅ Có quyền' : '❌ Không có quyền'}
          </div>
          <div className={`p-2 rounded ${isCompany ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
            <strong>Company Access:</strong> {isCompany ? '✅ Có quyền' : '❌ Không có quyền'}
          </div>
          <div className={`p-2 rounded ${isUser ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            <strong>User Access:</strong> {isUser ? '✅ Có quyền' : '❌ Không có quyền'}
          </div>
        </div>

        {isAdmin && (
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/admin'}
          >
            Truy cập Admin Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
