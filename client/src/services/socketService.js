import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    console.warn('⚡ [WebSocket] Cannot connect without JWT token.');
    return null;
  }

  // If already connected with same token, return existing instance
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  console.log('⚡ [WebSocket] Connecting to WebSocket server:', SOCKET_URL);

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000
  });

  socket.on('connect', () => {
    console.log('✅ [WebSocket] Connected successfully! Socket ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ [WebSocket] Connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ [WebSocket] Disconnected from server. Reason:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('⚡ [WebSocket] Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinSOSRoom = (sosId) => {
  if (socket && socket.connected && sosId) {
    socket.emit('join_sos_room', { sosId });
  }
};

export const leaveSOSRoom = (sosId) => {
  if (socket && socket.connected && sosId) {
    socket.emit('leave_sos_room', { sosId });
  }
};
