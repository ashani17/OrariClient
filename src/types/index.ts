// Common interfaces and types

export interface User {
    id: string;
    email: string;
    name: string;
    surname: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ApiError {
    message: string;
    statusCode: number;
} 