const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/users', messageController.getUsersList);
router.get('/conversation/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);

module.exports = router;
