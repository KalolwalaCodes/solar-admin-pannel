const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to the JSON file
const dataPath = path.join(__dirname, '../data/committies.json');

// Load the existing JSON data
let data;
try {
  data = require(dataPath); // Load the JSON data
} catch (error) {
  console.error("Error loading JSON file: ", error.message);
}

// GET request to retrieve committees
router.get('/', (req, res) => {
  console.log("sending data", data);

  if (!data) {
    return res.status(500).json({ msg: "Error loading data" });
  }
  res.setHeader('Cache-Control', 'no-store');
  res.json(data);
});

// POST request to update committee data
router.post('/update-committee', (req, res) => {
  const { committeeName, index, data: updatedData } = req.body;

  // Find the committee in the departments by name
  const committeeIndex = data.departments.findIndex(dept => dept.name === committeeName);

  // Validate committee existence
  if (committeeIndex === -1) {
    return res.status(400).json({ msg: "Committee not found" });
  }

  // Validate index
  if (typeof index !== 'number' || index < 0 || index >= data.departments[committeeIndex].data.length) {
    return res.status(400).json({ msg: "Invalid index provided" });
  }

  // Check if updatedData is structured correctly
  if (!Array.isArray(updatedData) || updatedData.length !== 1 || 
      updatedData[0].length !== data.departments[committeeIndex].columns.length) {
    return res.status(400).json({ msg: "Updated data does not match the structure" });
  }

  // Update the specific committee data with the new data
  data.departments[committeeIndex].data[index] = updatedData[0]; // Update the specific row with the new data

  // Write the updated data back to the JSON file
  fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON file: ", err.message);
      return res.status(500).json({ msg: "Error updating data" });
    }

    res.json({ msg: "Committee updated successfully", data: data.departments[committeeIndex] });
  });
});

// DELETE request to delete a specific row in the committee data
router.delete('/delete-row', (req, res) => {
  const { committeeName, index } = req.body;

  // Find the committee in the departments by name
  const committeeIndex = data.departments.findIndex(dept => dept.name === committeeName);

  // Validate committee existence
  if (committeeIndex === -1) {
    return res.status(400).json({ msg: "Committee not found" });
  }

  // Validate index
  if (typeof index !== 'number' || index < 0 || index >= data.departments[committeeIndex].data.length) {
    return res.status(400).json({ msg: "Invalid index provided" });
  }

  // Delete the row from the data array
  data.departments[committeeIndex].data.splice(index, 1); // Remove the specific row

  // Write the updated data back to the JSON file
  fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON file: ", err.message);
      return res.status(500).json({ msg: "Error deleting row" });
    }

    res.json({ msg: "Row deleted successfully", data: data.departments[committeeIndex] });
  });
});

// POST request to add a new committee member
router.post('/add-member', (req, res) => {
  const { committeeName, newMemberData } = req.body;

  // Find the committee in the departments by name
  const committeeIndex = data.departments.findIndex(dept => dept.name === committeeName);

  // Validate committee existence
  if (committeeIndex === -1) {
    return res.status(400).json({ msg: "Committee not found" });
  }

  // Check if newMemberData is structured correctly
  if (!Array.isArray(newMemberData) || newMemberData.length !== data.departments[committeeIndex].columns.length) {
    return res.status(400).json({ msg: "New member data does not match the structure" });
  }

  // Add the new member data to the committee
  data.departments[committeeIndex].data.push(newMemberData);

  // Write the updated data back to the JSON file
  fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON file: ", err.message);
      return res.status(500).json({ msg: "Error adding new member" });
    }

    res.json({ msg: "New member added successfully", data: data.departments[committeeIndex] });
  });
});

module.exports = router;
