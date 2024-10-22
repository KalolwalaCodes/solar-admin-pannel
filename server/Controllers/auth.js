// auth.js
const jwt = require('jsonwebtoken');

// Secret key for signing the token
const SECRET_KEY = 'normal secret key'; // Replace with your actual secret key

// Function to generate a JWT
const generateToken = (user) => {
  // Token will expire in 1 day (86400 seconds)
  const token=jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1d' });
  console.log("user",user,token)
  return token;
};

// Function to verify the JWT
const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

// Middleware to verify token
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
    if (token) {
      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
          return res.sendStatus(403); // Forbidden
        }
        req.user = user; // Store user data in request
        next();
      });
    } else {
      res.sendStatus(401); // Unauthorized
    }
  };
  
//   app.get('/admin-panel/protected', authenticateJWT, (req, res) => {
//     res.json({ message: 'This is a protected route', user: req.user });
//   });
  
module.exports = { generateToken, verifyToken,authenticateJWT };
