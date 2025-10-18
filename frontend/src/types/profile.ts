// Extended user profile interface based on the API response
export interface UserProfile {
    id: string;
    username: string;
    avatar_url: string | null;
    email: string;
    phone: string | null;
    address_street: string | null;
    address_ward: string | null;
    address_city: string | null;
    address_country: string | null;
    gender: string | null;
    last_loggedIn: string;
    created_at: string;
    updated_at: string;
    phone_verified: boolean;
    company_id: string | null;
    companies: {
        jobs: any[];
    };
    roles: {
        role_name: string;
    };
    events: any[];
    _count: {
        userNotifications: number;
        followedCompanies: number;
        savedJobs: number;
    };
}

export interface UserProfileResponse {
    success: boolean;
    data: UserProfile;
}


export interface UpdateUserProfileRequest {
    username: string;
    avatar_url: string;
    address_street: string;
    address_ward: string;
    address_city: string;
    address_country: string;
    gender: 'male' | 'female' | 'others';
}