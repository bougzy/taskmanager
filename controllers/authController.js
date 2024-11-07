const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register a new user
exports.registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ username, password });
  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      token: generateToken(user._id),
    },
  });
});

// Login a user
exports.loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
