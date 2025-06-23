import api from './api';

// Recurring Schedules
export const getRecurringSchedules = () => api.get('/recurring-schedule');
export const getRecurringSchedule = (id: number) => api.get(`/recurring-schedule/${id}`);
export const createRecurringSchedule = (data: any) => api.post('/recurring-schedule', data);
export const updateRecurringSchedule = (id: number, data: any) => api.put(`/recurring-schedule/${id}`, data);
export const deleteRecurringSchedule = (id: number) => api.delete(`/recurring-schedule/${id}`);

// Schedule Exceptions
export const getScheduleExceptions = (recurringScheduleId: number) => api.get(`/recurring-schedule/${recurringScheduleId}/exceptions`);
export const createScheduleException = (recurringScheduleId: number, data: any) => api.post(`/recurring-schedule/${recurringScheduleId}/exceptions`, data);
export const updateScheduleException = (id: number, data: any) => api.put(`/recurring-schedule/exceptions/${id}`, data);
export const deleteScheduleException = (id: number) => api.delete(`/recurring-schedule/exceptions/${id}`);

export default {
  getRecurringSchedules,
  getRecurringSchedule,
  createRecurringSchedule,
  updateRecurringSchedule,
  deleteRecurringSchedule,
  getScheduleExceptions,
  createScheduleException,
  updateScheduleException,
  deleteScheduleException,
}; 