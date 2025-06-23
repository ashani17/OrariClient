import api from './api';

export const getFreeRooms = (date: string, startTime: string, endTime: string) => {
  return api.get('/rooms/free', {
    params: { date, startTime, endTime },
  });
};

export default {
  getFreeRooms,
}; 