import React, { useEffect, useRef, useState } from 'react';
import chatService from '../../services/chatService';
import { useAuthStore } from '../../store/authStore';
import { Box, Button, Input, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChatSelectionPage from './ChatSelectionPage';
import { adminService } from '../../services/adminService';
import { ArrowBack, Person } from '@mui/icons-material';

interface ChatMessage {
  id: number;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  roles: string[];
}

const ChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [recentChats, setRecentChats] = useState<User[]>([]);
  const [allProfessors, setAllProfessors] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const otherUserId = searchParams.get('userId') || '';
  const myUserId = user?.id || '';

  // Fetch all professors and recent chats for sidebar (admins only)
  useEffect(() => {
    if (user?.role !== 'Admin') return;
    const fetchProfessorsAndChats = async () => {
      try {
        const users = await adminService.getAllUsers();
        const professors = users.filter((u: User) => Array.isArray(u.roles) && u.roles.includes('Professor'));
        setAllProfessors(professors);
        // Fetch all messages for this admin
        const allMessages: ChatMessage[] = [];
        for (const prof of professors) {
          const res = await chatService.fetchProfessorConversation(prof.id);
          if (Array.isArray(res.data) && res.data.length > 0) {
            allMessages.push(...res.data.map((m: ChatMessage) => ({ ...m, professorId: prof.id })));
          }
        }
        // Get unique professors with whom there are messages, sorted by most recent message
        const profIdToLastMsg: { [profId: string]: ChatMessage } = {};
        allMessages.forEach(msg => {
          if (!profIdToLastMsg[msg.professorId] || new Date(msg.timestamp) > new Date(profIdToLastMsg[msg.professorId].timestamp)) {
            profIdToLastMsg[msg.professorId] = msg;
          }
        });
        const recent = professors
          .filter(p => profIdToLastMsg[p.id])
          .sort((a, b) => new Date(profIdToLastMsg[b.id].timestamp).getTime() - new Date(profIdToLastMsg[a.id].timestamp).getTime());
        setRecentChats(recent);
      } catch (e) {
        setRecentChats([]);
      }
    };
    fetchProfessorsAndChats();
  }, [user?.role]);

  // Find admin and redirect for professors
  useEffect(() => {
    const findAdminAndRedirect = async () => {
      if (user?.role === 'Professor' && !otherUserId) {
        setAdminLoading(true);
        try {
          const admins = await adminService.getAllAdminsPublic();
          if (admins.length > 0) {
            const firstAdmin = admins[0];
            navigate(`/chat?userId=${firstAdmin.id}`);
          }
        } catch (error) {
          console.error('Error fetching admins:', error);
        } finally {
          setAdminLoading(false);
        }
      }
    };
    findAdminAndRedirect();
  }, [user?.role, otherUserId, navigate]);

  // Fetch conversation
  useEffect(() => {
    if (!myUserId || !otherUserId) return;
    setLoading(true);
    if (user?.role === 'Admin') {
      chatService.fetchProfessorConversation(otherUserId)
        .then(res => setMessages(res.data))
        .finally(() => setLoading(false));
    } else {
      chatService.fetchConversation(myUserId, otherUserId)
        .then(res => setMessages(res.data))
        .finally(() => setLoading(false));
    }
  }, [myUserId, otherUserId, user?.role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = {
      senderId: myUserId,
      receiverId: otherUserId,
      message: input.trim(),
    };
    const res = await chatService.sendMessage(newMsg);
    setMessages(prev => [...prev, res.data]);
    setInput('');
  };

  // Conditional rendering for admin sidebar layout
  if (user?.role === 'Admin' && !otherUserId) {
    return <ChatSelectionPage />;
  }
  if (user?.role === 'Professor' && !otherUserId) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6">Chat with Admin</Typography>
        <Typography>{adminLoading ? 'Finding admin...' : 'No admin found.'}</Typography>
      </Box>
    );
  }

  // Admin: sidebar + chat layout
  if (user?.role === 'Admin') {
    return (
      <Box sx={{ display: 'flex', height: '80vh', maxWidth: 900, margin: '40px auto 0 auto' }}>
        {/* Sidebar */}
        <Paper sx={{ width: 220, mr: 2, p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ p: 2, pb: 1 }}>Chats</Typography>
          <Divider />
          <List sx={{ flex: 1, overflowY: 'auto' }}>
            {recentChats.length === 0 ? (
              <ListItem><ListItemText primary="No chats yet" /></ListItem>
            ) : (
              recentChats.map(prof => (
                <ListItem
                  key={prof.id}
                  button
                  selected={prof.id === otherUserId}
                  onClick={() => navigate(`/chat?userId=${prof.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar><Person /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${prof.name || ''} ${prof.surname || ''}`.trim() || prof.email}
                    secondary={prof.email}
                  />
                </ListItem>
              ))
            )}
          </List>
          <Divider />
          <Button sx={{ m: 2, mt: 0 }} variant="outlined" onClick={() => navigate('/chat')}>New Chat</Button>
        </Paper>
        {/* Chat area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Button startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', mb: 1 }} onClick={() => navigate('/chat')}>
            Back
          </Button>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Chat</Typography>
          <Paper sx={{ width: 400, minHeight: 400, maxHeight: 500, flex: 1, overflowY: 'auto', mb: 2, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <List>
              {loading ? (
                <ListItem><ListItemText primary="Loading..." /></ListItem>
              ) : messages.length === 0 ? (
                <ListItem><ListItemText primary="No messages yet." /></ListItem>
              ) : (
                messages.map(msg => (
                  <ListItem key={msg.id} sx={{ justifyContent: msg.senderId === myUserId ? 'flex-end' : 'flex-start' }}>
                    <Box sx={{
                      bgcolor: msg.senderId === myUserId ? 'primary.light' : 'grey.200',
                      color: 'black',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      maxWidth: '70%',
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {msg.senderId === myUserId ? 'You' : 'Them'}
                      </Typography>
                      <Typography variant="body1">{msg.message}</Typography>
                      <Typography variant="caption" sx={{ float: 'right' }}>{new Date(msg.timestamp).toLocaleTimeString()}</Typography>
                    </Box>
                  </ListItem>
                ))
              )}
              <div ref={messagesEndRef} />
            </List>
          </Paper>
          <Box sx={{ display: 'flex', gap: 1, width: 400 }}>
            <Input
              fullWidth
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type your message..."
            />
            <Button variant="contained" onClick={handleSend} disabled={!input.trim()}>Send</Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Professor: normal chat layout
  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Chat</Typography>
      <Paper sx={{ flex: 1, overflowY: 'auto', mb: 2, p: 2 }}>
        <List>
          {loading ? (
            <ListItem><ListItemText primary="Loading..." /></ListItem>
          ) : messages.length === 0 ? (
            <ListItem><ListItemText primary="No messages yet." /></ListItem>
          ) : (
            messages.map(msg => (
              <ListItem key={msg.id} sx={{ justifyContent: msg.senderId === myUserId ? 'flex-end' : 'flex-start' }}>
                <Box sx={{
                  bgcolor: msg.senderId === myUserId ? 'primary.light' : 'grey.200',
                  color: 'black',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  maxWidth: '70%',
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {msg.senderId === myUserId ? 'You' : 'Them'}
                  </Typography>
                  <Typography variant="body1">{msg.message}</Typography>
                  <Typography variant="caption" sx={{ float: 'right' }}>{new Date(msg.timestamp).toLocaleTimeString()}</Typography>
                </Box>
              </ListItem>
            ))
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Input
          fullWidth
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type your message..."
        />
        <Button variant="contained" onClick={handleSend} disabled={!input.trim()}>Send</Button>
      </Box>
    </Box>
  );
};

export default ChatPage; 