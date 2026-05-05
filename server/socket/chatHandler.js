const Message = require('../models/Message');
const Match = require('../models/Match');
const { checkToxicity } = require('../services/toxicityFilter');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join a chat room (match-based)
    socket.on('join_room', (matchId) => {
      socket.join(matchId);
      console.log(`👤 Socket ${socket.id} joined room ${matchId}`);
    });

    // Leave room
    socket.on('leave_room', (matchId) => {
      socket.leave(matchId);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { matchId, senderId, content, isAnonymous } = data;
        
        // Check match status for rules
        const match = await Match.findById(matchId);
        if (!match) return socket.emit('error', { message: 'Match not found.' });

        if (match.status === 'pending') {
          if (match.initiator.toString() !== senderId.toString()) {
            return socket.emit('error', { message: 'You cannot reply until you accept the request.' });
          }
          // Initiator can only send 1 message
          const msgCount = await Message.countDocuments({ matchId, sender: senderId });
          if (msgCount >= 1) {
            return socket.emit('error', { message: 'You can only send 1 message before they accept your request.' });
          }
        }

        const toxResult = checkToxicity(content);
        const message = new Message({
          matchId,
          sender: senderId,
          content: toxResult.isToxic ? toxResult.cleaned : content,
          isAnonymous: isAnonymous || false,
          isFlagged: toxResult.isToxic
        });
        await message.save();
        await message.populate('sender', 'name profilePhoto');

        // Broadcast to room
        io.to(matchId).emit('receive_message', {
          message,
          warning: toxResult.isToxic ? 'Message filtered for inappropriate content.' : null
        });
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.matchId).emit('user_typing', {
        userId: data.userId,
        isTyping: data.isTyping
      });
    });

    // Read receipt
    socket.on('mark_read', async (data) => {
      try {
        await Message.updateMany(
          { matchId: data.matchId, sender: { $ne: data.userId }, readAt: null },
          { readAt: new Date() }
        );
        socket.to(data.matchId).emit('messages_read', { userId: data.userId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });
};
