import api from './api';
import { AxiosError } from 'axios';

// Types for admin operations
export interface CreateStudentDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateProfessorDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateAdminDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface CreateCourseDTO {
  CName: string;
  Credits: number;
  PId: number;
  Profesor: string;
}

export interface CreateEnrollmentDTO {
  studentId: string;
  courseId: number;
}

export interface CreateScheduleDTO {
  date: string;
  startTime: string;
  endTime: string;
  rId: number;
  professorId: string;
  cId: number;
}

export interface CreateRoomDTO {
  rName: string;
  rCapacity: number;
  rType: string;
  rDescription?: string;
}

class AdminService {
  // User Management
  async getAllUsers(): Promise<any[]> {
    try {
      const response = await api.get('/admin/users');
      // Handle reference object structure from JSON serialization
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      throw error;
    }
  }

  async getAllStudents(): Promise<any[]> {
    try {
      const response = await api.get('/admin/users/students');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch students');
      }
      throw error;
    }
  }

  async getAllProfessors(): Promise<any[]> {
    try {
      const response = await api.get('/admin/users/professors');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professors');
      }
      throw error;
    }
  }

  async getAllAdmins(): Promise<any[]> {
    try {
      const response = await api.get('/admin/users/admins');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch admins');
      }
      throw error;
    }
  }

  async getAllAdminsPublic(): Promise<any[]> {
    try {
      const response = await api.get('/admin/users/admins-public');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch admins');
      }
      throw error;
    }
  }

  async createStudent(data: CreateStudentDTO): Promise<any> {
    try {
      const response = await api.post('/admin/users/student', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create student');
      }
      throw error;
    }
  }

  async createProfessor(data: CreateProfessorDTO): Promise<any> {
    try {
      const response = await api.post('/admin/users/professor', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create professor');
      }
      throw error;
    }
  }

  async createAdmin(data: CreateAdminDTO): Promise<any> {
    try {
      const response = await api.post('/admin/users/admin', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create admin');
      }
      throw error;
    }
  }

  async updateUser(userId: string, data: UpdateUserDTO): Promise<any> {
    try {
      const response = await api.put(`/admin/users/${userId}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update user');
      }
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/admin/users/${userId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
      }
      throw error;
    }
  }

  // Course Management
  async getAllCourses(): Promise<any[]> {
    try {
      const response = await api.get('/admin/courses');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch courses');
      }
      throw error;
    }
  }

  async createCourse(data: any): Promise<any> {
    try {
      const response = await api.post('/admin/courses', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create course');
      }
      throw error;
    }
  }

  async deleteCourse(courseId: number): Promise<void> {
    try {
      await api.delete(`/admin/courses/${courseId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete course');
      }
      throw error;
    }
  }

  async updateCourse(courseId: number, data: any): Promise<any> {
    try {
      const response = await api.put(`/admin/courses/${courseId}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update course');
      }
      throw error;
    }
  }

  // Enrollment Management
  async getAllEnrollments(): Promise<any[]> {
    try {
      const response = await api.get('/admin/enrollments');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch enrollments');
      }
      throw error;
    }
  }

  async createEnrollment(data: CreateEnrollmentDTO): Promise<any> {
    try {
      const response = await api.post('/admin/enrollments', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create enrollment');
      }
      throw error;
    }
  }

  async deleteEnrollment(studentId: string, courseId: number): Promise<void> {
    try {
      await api.delete(`/admin/enrollments/${studentId}/${courseId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete enrollment');
      }
      throw error;
    }
  }

  // Schedule Management
  async getAllSchedules(): Promise<any[]> {
    try {
      const response = await api.get('/admin/schedules');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch schedules');
      }
      throw error;
    }
  }

  async getAllRooms(): Promise<any[]> {
    try {
      const response = await api.get('/admin/rooms');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch rooms');
      }
      throw error;
    }
  }

  async createRoom(data: CreateRoomDTO): Promise<any> {
    try {
      const response = await api.post('/admin/rooms', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create room');
      }
      throw error;
    }
  }

  async createSchedule(data: CreateScheduleDTO): Promise<any> {
    try {
      const response = await api.post('/admin/schedules', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create schedule');
      }
      throw error;
    }
  }

  async updateSchedule(scheduleId: number, data: CreateScheduleDTO): Promise<any> {
    try {
      const response = await api.put(`/admin/schedules/${scheduleId}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update schedule');
      }
      throw error;
    }
  }

  async deleteSchedule(scheduleId: number): Promise<void> {
    try {
      await api.delete(`/admin/schedules/${scheduleId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete schedule');
      }
      throw error;
    }
  }

  // Study Program Management
  async getAllStudyPrograms(): Promise<any[]> {
    try {
      const response = await api.get('/studyprogram');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch study programs');
      }
      throw error;
    }
  }

  async createStudyProgram(data: any): Promise<any> {
    try {
      const response = await api.post('/studyprogram', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create study program');
      }
      throw error;
    }
  }

  async updateStudyProgram(id: number, data: any): Promise<any> {
    try {
      const response = await api.put(`/studyprogram?id=${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update study program');
      }
      throw error;
    }
  }

  async deleteStudyProgram(id: number): Promise<void> {
    try {
      await api.delete(`/studyprogram/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete study program');
      }
      throw error;
    }
  }

  // Department Management
  async getAllDepartments(): Promise<any[]> {
    try {
      const response = await api.get('/department');
      const data = response.data;
      if (data && typeof data === 'object' && '$values' in data) {
        return data.$values || [];
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch departments');
      }
      throw error;
    }
  }

  async createDepartment(data: any): Promise<any> {
    try {
      const response = await api.post('/department', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create department');
      }
      throw error;
    }
  }

  async updateDepartment(id: number, data: any): Promise<any> {
    try {
      const response = await api.put(`/department?id=${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update department');
      }
      throw error;
    }
  }

  async deleteDepartment(id: number): Promise<void> {
    try {
      await api.delete(`/department/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete department');
      }
      throw error;
    }
  }
}

export const adminService = new AdminService(); 