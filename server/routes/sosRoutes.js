const express = require('express');
const sosController = require('../controllers/sosController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', sosController.triggerSOS);
router.get('/active', sosController.getActiveSOS);
router.get('/history', sosController.getSOSHistory);
router.patch('/:id/status', sosController.updateSOSStatus);
router.post('/:id/location', sosController.updateSOSLocation);
router.get('/:id/location', sosController.getSOSLocations);

module.exports = router;
