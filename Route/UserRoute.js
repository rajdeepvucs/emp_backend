// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login,logout } = require('../Controller/UserController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
module.exports = router;
