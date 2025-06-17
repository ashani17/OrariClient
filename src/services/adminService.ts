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
      return response.data;
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
      return response.data;
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
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professors');
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
      return response.data;
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

  // Enrollment Management
  async getAllEnrollments(): Promise<any[]> {
    try {
      const response = await api.get('/admin/enrollments');
      return response.data;
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
      return response.data;
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
      return response.data;
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
}

export const adminService = new AdminService(); 