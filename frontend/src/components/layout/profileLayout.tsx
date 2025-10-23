import { useAuthStore } from '@/store';
import { Outlet } from 'react-router-dom';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import Layout from './layout';
import { CompanyMenuItems, UserMenuItems } from '@/constants/profileSidebarItems';

const ProfileLayout = () => {
    const authUser = useAuthStore((s) => s.authUser);
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout?.();
    };

    const handleAvatarUpdate = (newAvatarUrl: string) => {
        // The avatar update is already handled in the ProfileSidebar component
        // through the auth store, so this callback can be used for additional
        // logic if needed (e.g., analytics, notifications, etc.)
        console.log('Avatar updated:', newAvatarUrl);
    };

    if (!authUser) {
        return <div className="h-screen w-full relative bg-white"><Outlet /></div>;
    }

    return (
        <Layout className="min-h-0!">
            <div className="w-full relative flex justify-center bg-gray-50">
                {authUser && (
                    <ProfileSidebar
                        username={authUser.username}
                        role={authUser.roles.role_name}
                        avatar={authUser.avatar_url ?? undefined}
                        navitems={
                            authUser?.roles.role_name === 'Company' ?
                                CompanyMenuItems : authUser?.roles.role_name === 'User' ?
                                    UserMenuItems : []
                        }
                        onLogout={handleLogout}
                        onAvatarUpdate={handleAvatarUpdate}
                    />
                )}

                <Outlet />
            </div>
        </Layout>
    );
};

export default ProfileLayout;

