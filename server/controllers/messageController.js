const Message = require('../models/Message');
const User = require('../models/User');
const { getIO } = require('../socket');

exports.getUsersList = async (req, res, next) => {
  try {
    // Get all registered users except current user
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email phone role status')
      .sort('name');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort('createdAt');

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      const err = new Error('Receiver ID and message text are required');
      err.statusCode = 400;
      err.status = 'fail';
      return next(err);
    }

    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      const err = new Error('Receiver user not found');
      err.statusCode = 404;
      err.status = 'fail';
      return next(err);
    }

    let newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      text
    });

    newMessage = await newMessage.populate('sender', 'name email');
    newMessage = await newMessage.populate('receiver', 'name email');

    // Emit WebSocket Real-time Message Event to both Receiver and Sender
    const io = getIO();
    if (io) {
      const payload = {
        message: newMessage,
        sender: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        },
        receiver: {
          id: receiverUser._id.toString(),
          name: receiverUser.name,
          email: receiverUser.email
        },
        timestamp: new Date()
      };

      // Send to receiver's private room
      io.to(`user:${receiverId}`).emit('receive_private_message', payload);
      // Send back to sender's room
      io.to(`user:${req.user.id}`).emit('receive_private_message', payload);
    }

    res.status(201).json({
      status: 'success',
      data: {
        message: newMessage
      }
    });
  } catch (err) {
    next(err);
  }
};
