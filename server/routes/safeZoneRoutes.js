const express = require('express');
const safeZoneController = require('../controllers/safeZoneController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .get(safeZoneController.getAllSafeZones)
  .post(safeZoneController.createSafeZone);

router
  .route('/:id')
  .delete(safeZoneController.deleteSafeZone);

module.exports = router;
