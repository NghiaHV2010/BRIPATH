import { useAuthStore } from '@/store';
import { type ReactNode } from 'react';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import Layout from './layout';
import { CompanyMenuItems, UserMenuItems } from '@/constants/profileSidebarItems';

interface ProfileLayoutProps {
    children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
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
        return <div className="h-screen w-full relative bg-white">{children}</div>;
    }

    return (
        <Layout className="!min-h-0">
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

                {children}
            </div>
        </Layout>
    );
};

export default ProfileLayout;

