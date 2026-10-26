const Contact = require('../models/Contact');
const { getIO } = require('../socket');

exports.getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id });
    res.status(200).json({
      status: 'success',
      results: contacts.length,
      data: {
        contacts
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createContact = async (req, res, next) => {
  try {
    const newContact = await Contact.create({
      ...req.body,
      userId: req.user.id
    });

    const io = getIO();
    if (io) {
      io.to(`user:${req.user.id}`).emit('contact_updated', { action: 'create', contact: newContact });
    }

    res.status(201).json({
      status: 'success',
      data: {
        contact: newContact
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      const err = new Error('No contact found with that ID');
      err.statusCode = 404;
      err.status = 'fail';
      return next(err);
    }

    const io = getIO();
    if (io) {
      io.to(`user:${req.user.id}`).emit('contact_updated', { action: 'update', contact });
    }

    res.status(200).json({
      status: 'success',
      data: {
        contact: contact
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!contact) {
      const err = new Error('No contact found with that ID');
      err.statusCode = 404;
      err.status = 'fail';
      return next(err);
    }

    const io = getIO();
    if (io) {
      io.to(`user:${req.user.id}`).emit('contact_updated', { action: 'delete', contactId: req.params.id });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
