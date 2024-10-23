const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { generateToken } = require('../Controllers/auth');

// AWS S3 Setup
const s3Client = new S3Client({ region: 'ap-south-1' });

const BUCKET_NAME = 'solarwebsite-documents'; // Replace with your actual bucket name
const USERDATA_FILE = 'users/admin_data.json'; // S3 file where all users will be stored

// Helper function to stream data from S3
const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
});

// Fetch all users from S3
const fetchUsersFromS3 = async () => {
    const getParams = {
        Bucket: BUCKET_NAME,
        Key: USERDATA_FILE,
    };

    try {
        const command = new GetObjectCommand(getParams);
        const response = await s3Client.send(command);
        const data = await streamToString(response.Body);
        return JSON.parse(data); // Return the users data as an array
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            return [];
        }
        console.error('Error fetching users from S3:', error);
        throw new Error('Failed to fetch users');
    }
};

// Save updated users data to S3
const saveUsersToS3 = async (usersData) => {
    const putParams = {
        Bucket: BUCKET_NAME,
        Key: USERDATA_FILE,
        Body: JSON.stringify(usersData, null, 2),
        ContentType: 'application/json',
    };

    try {
        const command = new PutObjectCommand(putParams);
        await s3Client.send(command);
        console.log('User data uploaded successfully to S3');
    } catch (error) {
        console.error('Error uploading user data to S3:', error);
        throw new Error('Failed to upload user data to S3');
    }
};
// POST route for login
router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
      const users = await fetchUsersFromS3();
      const user = users.find((user) => user.username === username);

      if (user) {
          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (isPasswordMatch) {
              const token = generateToken({ username: user.username, role: user.role });
              return res.status(200).json({ token, role: user.role });
          } else {
              return res.status(401).json({ message: 'Invalid credentials' });
          }
      } else {
          return res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login' });
  }
});

// GET route for fetching all users
router.get('/', async (req, res) => {
  try {
      const users = await fetchUsersFromS3();
      console.log(users,"here is everyuser");
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
  }
});
// POST route for user registration
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: crypto.randomUUID(),
        username,
        password: hashedPassword,
        role,
    };

    try {
        const users = await fetchUsersFromS3();

        const userExists = users.find((user) => user.username === username);
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        users.push(newUser);
        await saveUsersToS3(users);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error saving user to S3:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// PUT route for updating an existing user
router.put('/update/:username', async (req, res) => {
  const { username } = req.params; // Get the username from the URL directly
  console.log(username); // Log the username to verify it's being received correctly

  const { newUsername, newPassword, newRole } = req.body; // New user details
  console.log("updated data", username, newUsername, newPassword, newRole);

  try {
      const users = await fetchUsersFromS3();
      const userIndex = users.findIndex((user) => user.username === username);

      if (userIndex === -1) {
          return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = {
          ...users[userIndex],
          username: newUsername || users[userIndex].username,
          password: newPassword ? await bcrypt.hash(newPassword, 10) : users[userIndex].password,
          role: newRole || users[userIndex].role,
      };

      users[userIndex] = updatedUser;
      await saveUsersToS3(users);

      res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user' });
  }
});


// DELETE route for deleting a user
router.delete('/delete/:username', async (req, res) => {
    const { username } = req.params;
  console.log("i'm being hitted")
    try {
        const users = await fetchUsersFromS3();
        const updatedUsers = users.filter(user => user.username.trim(' ') !== username);

        if (updatedUsers.length === users.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        await saveUsersToS3(updatedUsers);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});



module.exports = router;
