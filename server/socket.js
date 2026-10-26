const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication Middleware for WebSockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
                    socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User no longer exists'));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      };

      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket connected: User ${socket.user.name} (${socket.user.id}), Socket ID: ${socket.id}`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Join global authenticated users room
    socket.join('authenticated_users');

    // Join admin room if user has admin role
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
      console.log(`👑 User ${socket.user.name} joined admin_room`);
    }

    // Join specific SOS room
    socket.on('join_sos_room', ({ sosId }) => {
      if (sosId) {
        socket.join(`sos:${sosId}`);
        console.log(`📡 Socket ${socket.id} joined SOS room: sos:${sosId}`);
      }
    });

    // Leave specific SOS room
    socket.on('leave_sos_room', ({ sosId }) => {
      if (sosId) {
        socket.leave(`sos:${sosId}`);
        console.log(`📡 Socket ${socket.id} left SOS room: sos:${sosId}`);
      }
    });

    // Real-Time Socket Private Messaging Event
    socket.on('send_private_message', async ({ receiverId, text }, ack) => {
      try {
        if (!receiverId || !text) return;

        let newMessage = await Message.create({
          sender: socket.user.id,
          receiver: receiverId,
          text
        });

        newMessage = await newMessage.populate('sender', 'name email');
        newMessage = await newMessage.populate('receiver', 'name email');

        const payload = {
          message: newMessage,
          sender: {
            id: socket.user.id,
            name: socket.user.name,
            email: socket.user.email
          },
          receiver: {
            id: receiverId
          },
          timestamp: new Date()
        };

        // Emit to receiver and sender rooms
        io.to(`user:${receiverId}`).emit('receive_private_message', payload);
        io.to(`user:${socket.user.id}`).emit('receive_private_message', payload);

        if (typeof ack === 'function') {
          ack({ status: 'ok', data: newMessage });
        }
      } catch (err) {
        console.error('Error handling send_private_message:', err.message);
        if (typeof ack === 'function') {
          ack({ status: 'error', message: err.message });
        }
      }
    });

    // Ping event for connection checking
    socket.on('ping_connection', (callback) => {
      if (typeof callback === 'function') {
        callback({ status: 'ok', timestamp: new Date().toISOString() });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket disconnected: User ${socket.user.name} (${socket.user.id}), Reason: ${reason}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('Socket.io has not been initialized yet.');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
