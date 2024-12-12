const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

router.post('/defense', (req, res) => {
  console.log('Full request body:', req.body); // Log the full body
  const { updatedData } = req.body;

  // Debugging: Check if updatedData exists
  console.log('Received updatedData:', updatedData);

  if (!updatedData || typeof updatedData !== 'object') {
    console.error('Invalid updatedData:', updatedData);
    return res.status(400).json({ message: 'updatedData is required and should be an object' });
  }

  const filePath = path.join(__dirname, '../data/Sustanabilitydata.json');
  
  // Debugging: Log before writing
  console.log('About to write to file:', filePath, updatedData);

  fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error('Failed to save data:', err);
      return res.status(500).json({ message: 'Failed to save data' });
    }
    console.log('File successfully updated at:', filePath); // Success log
    res.status(200).json({ message: 'Order updated successfully' });
  });
});

router.post('/investor', (req, res) => {
  console.log('Full request body:', req.body); // Log the full body
  const { updatedData } = req.body;

  // Debugging: Check if updatedData exists
  console.log('Received updatedData:', updatedData);

  if (!updatedData || typeof updatedData !== 'object') {
    console.error('Invalid updatedData:', updatedData);
    return res.status(400).json({ message: 'updatedData is required and should be an object' });
  }

  const filePath = path.join(__dirname, '../data/Investordata.json');
  
  // Debugging: Log before writing
  console.log('About to write to file:', filePath, updatedData);

  fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error('Failed to save data:', err);
      return res.status(500).json({ message: 'Failed to save data' });
    }
    console.log('File successfully updated at:', filePath); // Success log
    res.status(200).json({ message: 'Order updated successfully' });
  });
});

module.exports = router;
