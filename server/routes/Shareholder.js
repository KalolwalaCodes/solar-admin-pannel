const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Path to the JSON file
const dataPath = path.join(__dirname, "../data/shareholderdata.json");

// Helper function to write data to the JSON file
const writeDataToFile = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
};

// Load the existing JSON data
let data = [];
try {
  data = require(dataPath);
} catch (error) {
  console.error("Error loading JSON file: ", error.message);
}

// GET: Retrieve data
router.get("/", (req, res) => {

  res.setHeader("Cache-Control", "no-store");
  res.json(data);
});

// POST: Add a new item
router.post("/", (req, res) => {
  const newItem = req.body;
  if (!newItem.title || !newItem.subtitle || !newItem.value || !newItem.icon) {
    return res.status(400).json({ msg: "Missing required fields" });
  }
  data.push(newItem);
  writeDataToFile(data);
  res.status(201).json({ msg: "Item added successfully", newItem });
});

// PUT: Update an item by index
router.put("/:index", (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (index < 0 || index >= data.length) {
    return res.status(404).json({ msg: "Item not found" });
  }
  data[index] = { ...data[index], ...req.body };
  writeDataToFile(data);
  res.json({ msg: "Item updated successfully", updatedItem: data[index] });
});

// DELETE: Remove an item by index
router.delete("/:index", (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (index < 0 || index >= data.length) {
    return res.status(404).json({ msg: "Item not found" });
  }
  const deletedItem = data.splice(index, 1);
  writeDataToFile(data);
  res.json({ msg: "Item deleted successfully", deletedItem });
});

module.exports = router;
