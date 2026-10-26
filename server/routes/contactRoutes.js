const express = require('express');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router
  .route('/')
  .get(contactController.getAllContacts)
  .post(contactController.createContact);

router
  .route('/:id')
  .patch(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;
