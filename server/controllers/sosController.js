const SOSEvent = require('../models/SOSEvent');
const Contact = require('../models/Contact');
const LocationUpdate = require('../models/LocationUpdate');
const { getIO } = require('../socket');

exports.triggerSOS = async (req, res, next) => {
  try {
    const activeSOS = await SOSEvent.findOne({ userId: req.user.id, status: 'ACTIVE' });
    if (activeSOS) {
      const err = new Error('There is already an active SOS event.');
      err.statusCode = 400;
      err.status = 'fail';
      return next(err);
    }

    const newSOS = await SOSEvent.create({
      userId: req.user.id,
      location: req.body.location,
      activationMethod: req.body.activationMethod || 'SOS Button'
    });

    const contacts = await Contact.find({ userId: req.user.id });
    console.log(`SOS Triggered for user ${req.user.name}. Notifying ${contacts.length} contacts.`);

    // Broadcast Real-Time SOS Alert via WebSockets
    const io = getIO();
    if (io) {
      const socketPayload = {
        sos: newSOS,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone
        },
        timestamp: new Date()
      };
      // Broadcast to all connected clients & rooms
      io.emit('sos_triggered', socketPayload);
      io.to(`user:${req.user.id}`).emit('sos_triggered', socketPayload);
      io.to('admin_room').emit('sos_triggered', socketPayload);
    }

    res.status(201).json({
      status: 'success',
      data: {
        sos: newSOS,
        notifiedContacts: contacts.length
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getActiveSOS = async (req, res, next) => {
  try {
    const activeSOS = await SOSEvent.findOne({ userId: req.user.id, status: 'ACTIVE' });
    res.status(200).json({
      status: 'success',
      data: {
        sos: activeSOS
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSOSStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    if (status === 'CLOSED' || status === 'CANCELLED') {
      updateData.closedAt = Date.now();
    } else if (status === 'RESPONDED') {
      updateData.respondedAt = Date.now();
    }

    const sos = await SOSEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!sos) {
      const err = new Error('No SOS event found with that ID');
      err.statusCode = 404;
      err.status = 'fail';
      return next(err);
    }

    // Broadcast Real-Time SOS Status Update via WebSockets
    const io = getIO();
    if (io) {
      const statusPayload = {
        sos,
        userId: req.user.id,
        status: sos.status,
        timestamp: new Date()
      };
      io.emit('sos_status_updated', statusPayload);
      io.to(`sos:${sos._id}`).emit('sos_status_updated', statusPayload);
      io.to(`user:${req.user.id}`).emit('sos_status_updated', statusPayload);
    }

    res.status(200).json({
      status: 'success',
      data: {
        sos
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSOSHistory = async (req, res, next) => {
  try {
    const history = await SOSEvent.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: history.length,
      data: {
        history
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSOSLocation = async (req, res, next) => {
  try {
    const sos = await SOSEvent.findOne({ _id: req.params.id, userId: req.user.id, status: 'ACTIVE' });

    if (!sos) {
      const err = new Error('No active SOS event found with that ID');
      err.statusCode = 404;
      err.status = 'fail';
      return next(err);
    }

    const newLocation = await LocationUpdate.create({
      sosId: sos._id,
      location: req.body.location
    });

    // Also update main SOS event location so active SOS object has latest location
    sos.location = req.body.location;
    await sos.save();

    // Broadcast Real-Time SOS Location Update via WebSockets
    const io = getIO();
    if (io) {
      const locationPayload = {
        sosId: sos._id,
        userId: req.user.id,
        location: newLocation.location,
        fullLocationUpdate: newLocation,
        timestamp: new Date()
      };
      io.emit('sos_location_updated', locationPayload);
      io.to(`sos:${sos._id}`).emit('sos_location_updated', locationPayload);
      io.to(`user:${req.user.id}`).emit('sos_location_updated', locationPayload);
    }

    res.status(201).json({
      status: 'success',
      data: {
        location: newLocation
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSOSLocations = async (req, res, next) => {
  try {
    const locations = await LocationUpdate.find({ sosId: req.params.id }).sort('timestamp');
    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: {
        locations
      }
    });
  } catch (err) {
    next(err);
  }
};
