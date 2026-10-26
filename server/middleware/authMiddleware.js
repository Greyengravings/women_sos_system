const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const err = new Error('You are not logged in! Please log in to get access.');
      err.statusCode = 401;
      err.status = 'fail';
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      const err = new Error('The user belonging to this token no longer exists.');
      err.statusCode = 401;
      err.status = 'fail';
      return next(err);
    }

    req.user = currentUser;
    next();
  } catch (err) {
    const error = new Error('Invalid token or session expired');
    error.statusCode = 401;
    error.status = 'fail';
    next(error);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new Error('You do not have permission to perform this action');
      err.statusCode = 403;
      err.status = 'fail';
      return next(err);
    }
    next();
  };
};
