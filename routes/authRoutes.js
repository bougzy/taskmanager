const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { check } = require('express-validator');

const router = express.Router();

router.post(
  '/register',
  [
    check('username', 'Username is required').notEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  registerUser
);

router.post(
  '/login',
  [
    check('username', 'Username is required').notEmpty(),
    check('password', 'Password is required').notEmpty(),
  ],
  loginUser
);

module.exports = router;
