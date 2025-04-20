
const User = require('../Model/UserModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    
  };
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({ name, email, password });

    res.status(201).json({ message: "User registered successfully", data: user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.isValidPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
console.log(user)
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res
    .cookie('token', token, COOKIE_OPTIONS)
    .json({ message: "Login successful", data:{token, user} });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};


exports.logout = (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true
     
    });
  
    return res.status(200).json({ message: 'Logged out successfully' });
  };
  