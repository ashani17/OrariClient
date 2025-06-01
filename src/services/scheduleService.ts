import api from './api';
import type { Schedule, CreateScheduleDto, UpdateScheduleDto } from '../types/schedule';

class ScheduleService {
  async getSchedules(): Promise<Schedule[]> {
    const response = await api.get<Schedule[]>('/schedules');
    return response.data;
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await api.get<Schedule>(`/schedules/${id}`);
    return response.data;
  }

  async createSchedule(data: CreateScheduleDto): Promise<Schedule> {
    const response = await api.post<Schedule>('/schedules', data);
    return response.data;
  }

  async updateSchedule(id: string, data: UpdateScheduleDto): Promise<Schedule> {
    const response = await api.put<Schedule>(`/schedules/${id}`, data);
    return response.data;
  }

  async deleteSchedule(id: string): Promise<void> {
    await api.delete(`/schedules/${id}`);
  }
}

export const scheduleService = new ScheduleService(); 