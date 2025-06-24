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

export interface StudyProgram {
    spId: number;
    spName: string;
    dId: number;
    dName: string;
}

export interface CreateStudyProgramDto {
    spName: string;
    dId: number;
}

export interface UpdateStudyProgramDto {
    spName: string;
    dId: number;
}

export interface Department {
    dId: number;
    dName: string;
}

export interface CreateDepartmentDto {
    dName: string;
}

export interface UpdateDepartmentDto {
    dName: string;
} 