const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // Works with node-fetch@2
const { getExistingToken } = require('../Controllers/auth');
// Get contacts
let token;
router.get('/', async (req, res) => {
   token=getExistingToken();
  try {
    const response = await fetch('https://solargroup.com/admin-panel/submit-form/contact-us', { headers: {
      Authorization: `Bearer ${token}`, // Include token
    }});
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Backend A:', error);
    res.status(500).send('Error fetching data from Backend A');
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Send DELETE request to Backend B
    const response = await fetch(`https://solargroup.com/admin-panel/submit-form/contact-us/${id}`, {
      method: 'DELETE',
    });
  console.log(response,"here is response")
    if (response.ok) {
      res.status(200).send('Contact deleted successfully');
    } else {
      const errorMessage = await response.text();
      console.error('Failed to delete contact from Backend B:', errorMessage);
      res.status(response.status).send('Failed to delete contact from Backend B');
    }
  } catch (error) {
    console.error('Error deleting contact from Backend B:', error);
    res.status(500).send('Error deleting contact from Backend B');
  }
});

module.exports = router;
