import { useAuthStore } from '@/store';
import { type ReactNode } from 'react';
import { UserProfileSidebar } from '@/components/profile/UserProfileSidebar';
import { CompanyProfileSidebar } from '@/components/profile/CompanyProfileSidebar';

interface ProfileLayoutProps {
    children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
    const authUser = useAuthStore((s) => s.authUser);
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout?.();
    };

    if (!authUser) {
        return <div className="h-screen w-full relative bg-white">{children}</div>;
    }

    return (
        <div className="min-h-screen fle w-full relative bg-white">
            {authUser && authUser?.roles.role_name === 'Company' ? (
                <CompanyProfileSidebar
                    companyName={authUser.username}
                    industry={'IT Software | Saas'}
                    companyLogo={authUser.avatar_url ?? undefined}
                    onLogout={handleLogout}
                />
            ) : authUser?.roles.role_name === 'User' ? (
                <UserProfileSidebar
                    userName={authUser.username}
                    userAvatar={authUser.avatar_url ?? undefined}
                    onLogout={handleLogout}
                />
            ) : null}

            <div className={`${authUser ? 'ml-64' : ''} h-full overflow-auto`}>
                {children}
            </div>
        </div>
    );
};

export default ProfileLayout;
