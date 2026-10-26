const SafeZone = require('../models/SafeZone');
const { getIO } = require('../socket');

exports.getAllSafeZones = async (req, res, next) => {
  try {
    const safeZones = await SafeZone.find({ userId: req.user.id });
    res.status(200).json({
      status: 'success',
      results: safeZones.length,
      data: {
        safeZones
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createSafeZone = async (req, res, next) => {
  try {
    const newSafeZone = await SafeZone.create({
      ...req.body,
      userId: req.user.id
    });

    const io = getIO();
    if (io) {
      io.to(`user:${req.user.id}`).emit('safe_zone_updated', { action: 'create', safeZone: newSafeZone });
    }

    res.status(201).json({
      status: 'success',
      data: {
        safeZone: newSafeZone
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSafeZone = async (req, res, next) => {
  try {
    const safeZone = await SafeZone.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!safeZone) {
      const err = new Error('No safe zone found with that ID');
      err.statusCode = 404;
      err.status = 'fail';
      return next(err);
    }

    const io = getIO();
    if (io) {
      io.to(`user:${req.user.id}`).emit('safe_zone_updated', { action: 'delete', safeZoneId: req.params.id });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
