import api from './api';
import type { Schedule, CreateScheduleDto, UpdateScheduleDto } from '../types/schedule';
import { AxiosError } from 'axios';

class ScheduleService {
  async getSchedules(): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>('/schedules');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch schedules');
      }
      throw error;
    }
  }

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      const response = await api.get<Schedule>(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error('Schedule not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
      }
      throw error;
    }
  }

  async createSchedule(data: CreateScheduleDto): Promise<Schedule> {
    try {
      const response = await api.post<Schedule>('/schedules', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create schedule');
      }
      throw error;
    }
  }

  async updateSchedule(id: string, data: UpdateScheduleDto): Promise<Schedule> {
    try {
      const response = await api.put<Schedule>(`/schedules/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error('Schedule not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to update schedule');
      }
      throw error;
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      await api.delete(`/schedules/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error('Schedule not found');
        }
        throw new Error(error.response?.data?.message || 'Failed to delete schedule');
      }
      throw error;
    }
  }

  async getSchedulesByProfessor(professorId: string): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>(`/schedules/professor/${professorId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professor schedules');
      }
      throw error;
    }
  }

  async getSchedulesByRoom(roomId: string): Promise<Schedule[]> {
    try {
      const response = await api.get<Schedule[]>(`/schedules/room/${roomId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch room schedules');
      }
      throw error;
    }
  }
}

export const scheduleService = new ScheduleService(); 