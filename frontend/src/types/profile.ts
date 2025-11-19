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
    role_id: number;
    is_2fa_enabled: boolean;
    companies?: {
        jobs?: [
            {
                _count: {
                    applicants: number
                }
            }
        ];
        status: string;
        company_type: string;
        fax_code: string;
        company_website?: string;
        is_verified?: boolean;
        background_url?: string;
        business_certificate: string;
        description?: string;
        longitude?: number;
        latitude?: number;
        employees?: number;
        companyTags?: [
            {
                tags: {
                    label_name: string
                }
            }
        ];
        fields?: {
            field_name: string;
        }
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
    data?: UserProfile;
    message?: string;
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