const path = require('path');
const fs = require('fs');

// Path to the JSON file
const dataPath = path.join(__dirname, '/defense.json');
console.log(dataPath, "the path is");

// Helper function to read JSON data
const readData = (dataPathOfProducts) => {
    return new Promise((resolve, reject) => {
        fs.readFile(dataPathOfProducts, "utf8", (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

// Helper function to write JSON data
const writeData = (dataPathOfProducts, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(dataPathOfProducts, JSON.stringify(data, null, 2), "utf8", (err) => {
            if (err) reject(err);
            else resolve("Data successfully written to file.");
        });
    });
};

// Function to write IDs in each data item
const writeIDInFile = async () => {
    try {
        let data = JSON.parse(await readData(dataPath)); // Read and parse the JSON file
        data.forEach((item, index) => {
            item.id = index + 1; // Add an ID to each item (1-based index)
        });

        await writeData(dataPath, data); // Write the updated data back to the file
        console.log("IDs have been added and file has been updated successfully.");
    } catch (error) {
        console.error("Error processing file:", error);
    }
};

writeIDInFile();
