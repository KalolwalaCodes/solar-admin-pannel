const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');
const {authenticateJWT} =require('../Controllers/auth.js')

// Path to the JSON file
const dataPath = path.join(__dirname, '../data/Chartdata.json');
// Helper function to read and write JSON data
const updateJSONFile = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};
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

// POST request to update data
router.post('/update',authenticateJWT, (req, res) => {
  const newData = req.body; // Assume newData is the complete updated data

  // Write new data to the file
  fs.writeFile(dataPath, JSON.stringify(newData, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file: ", err.message);
      return res.status(500).json({ msg: "Error updating data" });
    }
    // Update the in-memory data variable as well
    data = newData;
    res.json({ msg: "Data updated successfully" });
  });
});


router.put('/edit/:datasetIndex/:entryIndex',authenticateJWT, (req, res) => {
  const { datasetIndex, entryIndex } = req.params;
  const { name, value, color } = req.body;

  if (!data || !data.datasets[datasetIndex]) {
    return res.status(404).json({ msg: "Dataset not found" });
  }

  // Update the specific entry
  data.datasets[datasetIndex][entryIndex] = { name, value, color };
  updateJSONFile(data); // Save changes to JSON file

  res.json({ msg: "Entry updated successfully", data });
});

// DELETE request to remove an entry
router.delete('/delete/:datasetIndex/:entryIndex',authenticateJWT, (req, res) => {
  const { datasetIndex, entryIndex } = req.params;

  if (!data || !data.datasets[datasetIndex]) {
    return res.status(404).json({ msg: "Dataset not found" });
  }

  // Remove the entry
  data.datasets[datasetIndex].splice(entryIndex, 1);
  updateJSONFile(data); // Save changes to JSON file

  res.json({ msg: "Entry deleted successfully", data });
});


module.exports = router;
