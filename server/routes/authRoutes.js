const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Admin-only route to demonstrate JWT Roles
router.get('/users', protect, restrictTo('admin'), authController.getAllUsers);

module.exports = router;
