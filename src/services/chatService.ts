import api from './api';

export const fetchConversation = (user1Id: string, user2Id: string) => {
  return api.get(`/chat/conversation`, {
    params: { user1Id, user2Id },
  });
};

export const sendMessage = (message: {
  senderId: string;
  receiverId: string;
  message: string;
}) => {
  return api.post('/chat/send', message);
};

export const fetchProfessorConversation = (professorId: string) => {
  return api.get(`/chat/professor-conversation/${professorId}`);
};

export default {
  fetchConversation,
  sendMessage,
  fetchProfessorConversation,
}; 