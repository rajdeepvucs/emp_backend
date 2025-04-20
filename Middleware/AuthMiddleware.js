const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel'); // No 'import' here
require('dotenv').config();

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id); 

    if (!user) {
      return res.status(400).json({ message: "Token not valid - user not found" });
    }

    req.user = decoded; 
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token" });
  }
};
