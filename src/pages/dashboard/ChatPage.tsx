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
  professorId?: string;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  surname?: string;
  email: string;
  roles?: string[];
}

const ChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentChats, setRecentChats] = useState<User[]>([]);
  const [allProfessors, setAllProfessors] = useState<User[]>([]);
  const [allAdmins, setAllAdmins] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const otherUserId = searchParams.get('userId') || '';
  const myUserId = user?.id || '';

  // Helper function to get user display name
  const getUserDisplayName = (user: User) => {
    const firstName = user.firstName || user.name || '';
    const lastName = user.lastName || user.surname || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.email;
  };

  // Helper function to get admin name by ID
  const getAdminName = (adminId: string) => {
    const admin = allAdmins.find(a => a.id === adminId);
    return admin ? getUserDisplayName(admin) : 'Admin';
  };

  // Fetch all professors, admins and recent chats for sidebar (admins only)
  useEffect(() => {
    if (user?.role !== 'Admin') return;
    const fetchProfessorsAndChats = async () => {
      try {
        const [usersResponse, adminsResponse] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllAdmins()
        ]);
        
        const professors = usersResponse.filter((u: User) => 
          Array.isArray(u.roles) && u.roles.includes('Professor')
        );
        setAllProfessors(professors);
        setAllAdmins(adminsResponse);
        
        // Get unique professors with whom there are messages, sorted by most recent message
        const profIdToLastMsg: { [profId: string]: ChatMessage } = {};
        
        // Fetch conversations for each professor to find the most recent messages
        for (const prof of professors) {
          try {
            const res = await chatService.fetchProfessorConversation(prof.id);
            if (Array.isArray(res.data) && res.data.length > 0) {
              // Find the most recent message for this professor
              const mostRecentMsg = res.data.reduce((latest: ChatMessage, current: ChatMessage) => 
                new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
              );
              profIdToLastMsg[prof.id] = mostRecentMsg;
            }
          } catch (error) {
            console.error(`Error fetching conversation for professor ${prof.id}:`, error);
          }
        }
        
        // Sort professors by most recent message timestamp
        const recent = professors
          .filter(p => profIdToLastMsg[p.id])
          .sort((a, b) => {
            const timeA = new Date(profIdToLastMsg[a.id].timestamp).getTime();
            const timeB = new Date(profIdToLastMsg[b.id].timestamp).getTime();
            return timeB - timeA;
          });
        
        setRecentChats(recent);
      } catch (e) {
        console.error('Error fetching professors and chats:', e);
        setRecentChats([]);
      }
    };
    fetchProfessorsAndChats();
  }, [user?.role]);

  // Fetch conversation
  useEffect(() => {
    if (!myUserId) return;
    setLoading(true);
    if (user?.role === 'Admin') {
      if (!otherUserId) return;
      chatService.fetchProfessorConversation(otherUserId)
        .then(res => setMessages(res.data))
        .finally(() => setLoading(false));
    } else {
      // For professors, fetch all messages between them and any admin
      chatService.fetchProfessorConversation(myUserId)
        .then(res => setMessages(res.data))
        .finally(() => setLoading(false));
    }
  }, [myUserId, otherUserId, user?.role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    let receiverId = otherUserId;
    
    // For professors, if no specific admin is selected, send to the first available admin
    if (user?.role === 'Professor' && !receiverId) {
      try {
        const admins = await adminService.getAllAdminsPublic();
        if (admins.length > 0) {
          receiverId = admins[0].id;
        } else {
          console.error('No admins available');
          return;
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        return;
      }
    }
    
    const newMsg = {
      senderId: myUserId,
      receiverId: receiverId,
      message: input.trim(),
    };
    const res = await chatService.sendMessage(newMsg);
    setMessages(prev => [...prev, res.data]);
    setInput('');
  };

  // Helper function to get sender name for messages
  const getSenderName = (msg: ChatMessage) => {
    if (msg.senderId === myUserId) {
      return 'You';
    }
    
    if (user?.role === 'Admin') {
      // For admin view, if sender is not the current professor, it's another admin
      // This allows all admins to see messages sent by other admins to professors
      if (msg.senderId !== otherUserId) {
        return getAdminName(msg.senderId);
      } else {
        // Sender is the professor
        return getUserDisplayName(allProfessors.find(p => p.id === otherUserId) || { id: otherUserId, email: 'Professor' });
      }
    } else {
      // For professor view, all admin messages show as "Admin" (no specific names)
      return 'Admin';
    }
  };

  // Helper function to check if multiple admins are in the conversation
  const hasMultipleAdmins = () => {
    if (user?.role !== 'Admin' || !messages.length) return false;
    const adminIds = new Set(messages
      .filter(msg => msg.senderId !== otherUserId && msg.senderId !== myUserId)
      .map(msg => msg.senderId)
    );
    return adminIds.size > 0;
  };

  // Helper function to check if a professor has conversations with multiple admins
  const hasMultipleAdminsForProfessor = (professorId: string) => {
    const professorMessages = messages.filter(msg => 
      (msg.senderId === professorId && msg.receiverId !== myUserId) ||
      (msg.receiverId === professorId && msg.senderId !== myUserId)
    );
    
    const adminIds = new Set(professorMessages
      .filter(msg => msg.senderId !== professorId && msg.receiverId !== professorId)
      .map(msg => msg.senderId === professorId ? msg.receiverId : msg.senderId)
    );
    
    return adminIds.size > 1;
  };

  // Conditional rendering for admin sidebar layout
  if (user?.role === 'Admin' && !otherUserId) {
    return <ChatSelectionPage />;
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
                    primary={getUserDisplayName(prof)}
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
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
            Chat with {otherUserId ? getUserDisplayName(allProfessors.find(p => p.id === otherUserId) || { id: otherUserId, email: 'Professor' }) : 'Professor'}
            {hasMultipleAdmins() && (
              <Typography variant="caption" display="block" color="text.secondary">
                (Multiple admins in conversation)
              </Typography>
            )}
          </Typography>
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
                        {getSenderName(msg)}
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
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Chat with All Admins</Typography>
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
                    {getSenderName(msg)}
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