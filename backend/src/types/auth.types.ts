export interface GoogleLoginRequestDto {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
}

export interface AuthUserRequestDto {
    id: string;
    username: string;
    avatar_url?: string | null;
    email: string;
    phone_verified: boolean;
    company_id?: string | null;
    roles: {
        role_name: string;
    };
    _count: {
        userNotifications: number;
    };
}

export interface SendOTPRequestDto {
    id?: string;
    email: string;
}

export interface RegisterRequestDto {
    username: string;
    email: string;
    password: string;
    avatar_url?: string;
    last_loggedIn?: Date;
}