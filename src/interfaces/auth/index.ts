export interface LoginCredentials {
    email?: string;
    password?: string;
    [key: string]: any; // Allow flexible inputs
}

export interface SignupData {
    name?: string;
    email?: string;
    password?: string;
    [key: string]: any;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
