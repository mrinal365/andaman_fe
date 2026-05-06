import { User } from "../user";

export interface LoginCredentials {
    email?: string;
    password?: string;
    [key: string]: any; 
}

export interface SignupData {
    name?: string;
    email?: string;
    password?: string;
    [key: string]: any;
}

export interface AuthResponse {
    user: User;
    token: string;
    isNewUser?: boolean;
}
