const express = require("express");
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const {authenticateJWT} =require('../Controllers/auth')

const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');


const path = require('path');
const { Upload } = require('@aws-sdk/lib-storage');

const dataPath = path.join(__dirname, '../data/Investordata.json');
let data;
const storage = multer.memoryStorage();

const upload = multer({ storage });
const s3 = new S3Client({ region: 'ap-south-1' });

try {
 data = require(dataPath); // Load the JSON data
} catch (error) {
  console.error("Error loading JSON file: ", error.message);
}

router.get('/', async (req, res) => {
  if (!data) {
    return res.status(500).json({ msg: "Error loading data" });
  }

  // console.log(data);
  res.json(data); 
})
.patch('/', authenticateJWT, async (req, res) => {
  const { previousFileName, newFileName, folderName, category } = req.body;
  console.log(newFileName, previousFileName, folderName, category, "here is data");
  console.log(data[category],"here is the data");
  const catEgoryS = data[category];
  console.log(catEgoryS,"here is the data");
  if (!Array.isArray(catEgoryS)) {
      return res.status(400).send('Invalid data structure: category should be an array');
  }

  for (const catEgory of catEgoryS) {
      if (catEgory.title === folderName) {
          for (const detail of catEgory.items) { // Access items correctly
              for (const item of detail.details) {
                  if (item.title === previousFileName) {
                      item.title = newFileName;
                      break; // Exit loop after updating
                  }
              }
          }
          break; // Exit outer loop after processing the announcement
      }
  }

  // Write the updated data back to the JSON file
  fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
          console.error('Error writing to file:', err);
          return res.status(500).send('Error updating data');
      }
      res.status(200).send('Data updated successfully');
  });
})
.delete('/',authenticateJWT, async (req, res) => {
    const { fileName, folderName, category } = req.body;
    console.log(fileName, folderName, category, "here is data");
    console.log(data[category], "here is the data");
    
    const catEgoryS = data[category];
    console.log(catEgoryS, "here is the data");
  
    // Check if category exists and is an array
    if (!Array.isArray(catEgoryS)) {
      return res.status(400).send('Invalid data structure: category should be an array');
    }
  
    // Loop through the category to find the correct folder
    for (const catEgory of catEgoryS) {
      if (catEgory.title === folderName) {
        for (const detail of catEgory.items) {
          // Check if the 'details' property is an array
          if (Array.isArray(detail.details)) {
            // Find the index of the item to delete
            const itemIndex = detail.details.findIndex(item => item.title === fileName);
  
            // If the item is found, remove it from the array
            if (itemIndex !== -1) {
              detail.details.splice(itemIndex, 1); // Delete the file object
              break; // Exit loop after deletion
            }
          }
        }
      }
    }
  
    // Write the updated data back to the JSON file
    fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return res.status(500).send('Error updating data');
      }
      console.log("deleted")
      res.status(200).send('File object deleted successfully');
    });
})
.post('/upload-files',authenticateJWT, upload.single('file'), async (req, res) => {
  const { folderName, itemsHeading, category } = req.body;
  console.log("the body", req.body);
  const file = req.file;

  if (!file) {
      return res.status(400).send('File is required');
  }

  try {
      const fileName = file.originalname;
      let uploadParams;

      if (itemsHeading.toLowerCase() !== folderName.toLowerCase()) {
          uploadParams = {
              Bucket: 'solarwebsite-documents',
              Key: `Investors-Relation/${category}/${folderName}/${itemsHeading}/${fileName}`, // Keep spaces in key
              Body: file.buffer,
              ContentType: file.mimetype,
          };
      } else {
          uploadParams = {
              Bucket: 'solarwebsite-documents',
              Key: `Investors-Relation/${category}/${itemsHeading}/${fileName}`, // Keep spaces in key
              Body: file.buffer,
              ContentType: file.mimetype,
          };
      }

      const parallelUpload = new Upload({
          client: s3,
          params: uploadParams,
      });

      const s3UploadResult = await parallelUpload.done();
      let fileUrl = s3UploadResult.Location;
      let s3FilePath = decodeURIComponent(fileUrl.split('amazonaws.com/')[1]);  // Decode URL to remove %20

      // Replace '+' with spaces after decoding, which S3 sometimes uses for spaces
      s3FilePath = s3FilePath.replace(/\+/g, ' ');
      fileUrl = fileUrl.replace(/\+/g, ' ');

      console.log(s3FilePath, "here is the path");
      console.log(fileUrl, "here is the path original");

      // Update JSON structure
      const categoryData = data[category];

      if (!Array.isArray(categoryData)) {
          return res.status(400).send('Invalid data structure: category should be an array');
      }

      let folderFound = false;
      for (const categoryItem of categoryData) {
          if (categoryItem.title.toLowerCase() === folderName.toLowerCase()) {
              categoryItem.items.forEach((item) => {
                  if (item.heading.toLowerCase() === itemsHeading.toLowerCase()) {
                      item.details. unshift({
                          title: file.originalname,
                          url: s3FilePath,  // Use decoded file path with spaces
                          fileType: file.mimetype,
                      });
                  }
              });
              folderFound = true;
              break;
          }
      }

      if (!folderFound) {
          return res.status(400).send('Folder not found in category');
      }

      // Write the updated data back to the JSON file
      fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
          if (err) {
              console.error('Error writing to file:', err);
              return res.status(500).send('Error updating data');
          }
          console.log("File uploaded and JSON updated successfully.");
          res.status(200).send('File uploaded and JSON updated successfully');
      });

  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while uploading the file.');
  }
})
.post('/create-folder-nesting',authenticateJWT, async (req, res) => {
  const { folderName, category, activeFD } = req.body;

  console.log(folderName, category, activeFD);
  if (!folderName || !category || activeFD === undefined) {
      return res.status(400).send('Folder name, category, and activeFD are required');
  }

  try {
      // Read the current data structure from the JSON file
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const categoryData = data[category];

      // Validate if category exists and is an array
      if (!Array.isArray(categoryData)) {
          return res.status(400).send('Invalid data structure: category should be an array');
      }

      // Find the item in categoryData that matches the activeFD title
      const matchingCategoryItem = categoryData.find(item => item.title.toLowerCase() === activeFD.toLowerCase());

      if (!matchingCategoryItem) {
          return res.status(400).send('No matching category item found for the provided activeFD');
      }

      // Check if the folder (with the same name) already exists in the matching item's details
      const folderExists = matchingCategoryItem.items.some(item => item.heading.toLowerCase() === folderName.toLowerCase());

      if (folderExists) {
          return res.status(400).send('Folder already exists');
      }

      // Add new folder with an empty 'details' array to the matching item's items array
      matchingCategoryItem.items. unshift({
          heading: folderName,
          details: []
      });

      // Write the updated structure back to the JSON file
      fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
          if (err) {
              console.error('Error writing to file:', err);
              return res.status(500).send('Error updating data');
          }
          console.log("Folder created successfully.");
          res.status(200).send('Folder created successfully');
      });

  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while creating the folder.');
  }
})
.post('/create-folder',authenticateJWT, async (req, res) => {
  const { folderName, category } = req.body;

  if (!folderName || !category) {
      return res.status(400).send('Folder name, items heading, and category are required');
  }

  try {
      // Read the current data structure from the JSON file
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const categoryData = data[category];

      // Validate if category exists and is an array
      if (!Array.isArray(categoryData)) {
          return res.status(400).send('Invalid data structure: category should be an array');
      }

      // Check if the folder (with the same name) already exists
      let folderExists = categoryData.some(categoryItem => categoryItem.title.toLowerCase() === folderName.toLowerCase());

      if (folderExists) {
          return res.status(400).send('Folder already exists');
      }

      // Add new folder with an empty items array
      categoryData. unshift({
          title: folderName,
          items: [
              
          ]
      });

      // Write the updated structure back to the JSON file
      fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
          if (err) {
              console.error('Error writing to file:', err);
              return res.status(500).send('Error updating data');
          }
          console.log("Folder created successfully.");
          res.status(200).send('Folder created successfully');
      });

  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while creating the folder.');
  }
}).post('/delete-folder-nesting',authenticateJWT, async (req, res) => {
    const { folderName, category, parentFolder } = req.body;
  
    // Input validation
    if (!folderName || !category || parentFolder === undefined) {
      return res.status(400).send('Folder name, category, and parentFolder are required');
    }
  
    try {
      // Read current data
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const categoryData = data[category];
  
      // Validate category
      if (!Array.isArray(categoryData)) {
        return res.status(400).send('Invalid data structure: category should be an array');
      }
  
      // Find the activeFD category item
      const matchingCategoryItem = categoryData.find(item => item.title.toLowerCase() === parentFolder.toLowerCase());
  
      if (!matchingCategoryItem) {
        return res.status(404).send('No matching category item found for the provided parentFolder');
      }
  
      // Find the folder to be deleted
      const folderIndex = matchingCategoryItem.items.findIndex(item => item.heading.toLowerCase() === folderName.heading.toLowerCase());
  
      if (folderIndex === -1) {
        return res.status(404).send('Folder not found');
      }
  
      // Delete the folder from the items array
      matchingCategoryItem.items.splice(folderIndex, 1);
  
      // Write updated data
      await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2)); // Use promises for better error handling
      console.log('Folder deleted successfully.');
      res.status(200).send('Folder deleted successfully');
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while deleting the folder.');
    }
  })  
  .post('/delete-folder',authenticateJWT, async (req, res) => {
    const { folderName, category } = req.body;
  
    // Input validation
    if (!folderName || !category) {
      return res.status(400).send('Folder name and category are required');
    }
  
    try {
      // Read current data
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const categoryData = data[category];
  
      // Validate category
      if (!Array.isArray(categoryData)) {
        return res.status(400).send('Invalid data structure: category should be an array');
      }
  
      // Find the folder to be deleted
      const folderIndex = categoryData.findIndex(item => item.title.toLowerCase() === folderName.toLowerCase());
  
      if (folderIndex === -1) {
        return res.status(404).send('Folder not found');
      }
  
      // Delete the folder from the category
      categoryData.splice(folderIndex, 1);
  
      // Write updated data
      fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          return res.status(500).send('Error updating data');
        }
        console.log('Folder deleted successfully.');
        res.status(200).send('Folder deleted successfully');
      });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while deleting the folder.');
    }
  })
  .post('/edit-folder-nesting',authenticateJWT, async (req, res) => {
    const { oldFolderName, newFolderName, category, parentFolder } = req.body;
   console.log(oldFolderName, newFolderName, category, parentFolder,"hgeugdwvi")
    if (!oldFolderName || !newFolderName || !category || !parentFolder) {
        return res.status(400).send('Folder name, new folder name, category, and parentFolder are required');
    }

    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const categoryData = data[category];

        if (!Array.isArray(categoryData)) {
            return res.status(400).send('Invalid data structure: category should be an array');
        }

        const matchingCategoryItem = categoryData.find(item => item.title.toLowerCase() === parentFolder.toLowerCase());

        if (!matchingCategoryItem) {
            return res.status(404).send('No matching parent folder found');
        }

        const folderIndex = matchingCategoryItem.items.findIndex(item => item.heading.toLowerCase() === oldFolderName.toLowerCase());

        if (folderIndex === -1) {
            return res.status(404).send('Folder not found');
        }

        // Check if the new folder name already exists
        const newFolderExists = matchingCategoryItem.items.some(item => item.heading.toLowerCase() === newFolderName.toLowerCase());
        if (newFolderExists) {
            return res.status(400).send('A folder with the new name already exists');
        }

        // Update the folder name
        matchingCategoryItem.items[folderIndex].heading = newFolderName;

        await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2));
        console.log('Folder name updated successfully.');
        res.status(200).send('Folder name updated successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while editing the folder.');
    }
})
.post('/edit-folder', authenticateJWT,async (req, res) => {
  const { folderName, newFolderName, category } = req.body;

  if (!folderName || !newFolderName || !category) {
      return res.status(400).send('Folder name, new folder name, and category are required');
  }

  try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const categoryData = data[category];

      if (!Array.isArray(categoryData)) {
          return res.status(400).send('Invalid data structure: category should be an array');
      }

      const folderIndex = categoryData.findIndex(item => item.title.toLowerCase() === folderName.toLowerCase());

      if (folderIndex === -1) {
          return res.status(404).send('Folder not found');
      }

      // Check if the new folder name already exists
      const newFolderExists = categoryData.some(item => item.title.toLowerCase() === newFolderName.toLowerCase());
      if (newFolderExists) {
          return res.status(400).send('A folder with the new name already exists');
      }

      // Update the folder name
      categoryData[folderIndex].title = newFolderName;

      await fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2));
      console.log('Folder name updated successfully.');
      res.status(200).send('Folder name updated successfully');
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while editing the folder.');
  }
})

  
  



  

module.exports = router;
