const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.register = async (req, res, next) => {
  try {
    console.log('Register request body:', req.body);
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Please provide email and password');
      err.statusCode = 400;
      err.status = 'fail';
      return next(err);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      const err = new Error('Incorrect email or password');
      err.statusCode = 401;
      err.status = 'fail';
      return next(err);
    }

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};
