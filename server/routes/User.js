const express=require("express");
const { generateToken } = require('../Controllers/auth');

const router=express.Router();
router.post('/', async (req, res) => {
  const { username, password } = req.body;
console.log("i'm being hit")
  // Replace with your own authentication logic
  if (username === 'admin' && password === 'password') { // Replace with real verification logic
    const user = { id: 1, username }; // Replace with user data from your database
    const token = generateToken(user); // Generate token
    res.status(200).json({ token }); // Send back a token
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
module.exports=router;