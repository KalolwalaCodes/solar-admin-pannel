const express = require("express");
const sustainabilityRouter = express.Router();
const fs = require('fs');
const multer = require('multer');
const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const {readSustainabilityData}=require('./helper01');

const path = require('path');
const { Upload } = require('@aws-sdk/lib-storage');

const dataPath = path.join(__dirname, '../data/Sustanabilitydata.json');
let data;
const storage = multer.memoryStorage();

const upload = multer({ storage });
const s3 = new S3Client({ region: 'ap-south-1' });

try {
 data = require(dataPath); // Load the JSON data
} catch (error) {
  console.error("Error loading JSON file: ", error.message);
}

sustainabilityRouter.get('/', async (req, res) => {
    data=await readSustainabilityData();
  if (!data) {
    console.log("no data present in sustainability");
    return res.status(500).json({ msg: "Error loading data" });
  }
  res.setHeader('Cache-Control', 'no-store');
  // console.log(data);
  res.json(data); 
})
.patch('/', async (req, res) => {
  const { previousFileName, newFileName, folderName, category } = req.body;
  console.log(newFileName, previousFileName, folderName, category, "here is data");
  console.log(data[category],"here is the datat");
  const catEgoryS = data[category];
  console.log(catEgoryS,"here is the datat");
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
.delete('/', async (req, res) => {
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
.post('/upload-files', upload.single('file'), async (req, res) => {
    const {  folderName, itemsHeading, category } = req.body;
    console.log("the body",req.body);
    const file = req.file;

    if (!file) {
        return res.status(400).send('File is required');
    }

    try {
        // Upload file to S3
        let uploadParams;
        const fileName=file.originalname;
        if(itemsHeading!=folderName){
            uploadParams = {
                Bucket: 'solarwebsite-documents', // Your S3 bucket name
                Key: `Investors-Relation/${category}/${folderName}/${itemsHeading}/${fileName}`, // Generate unique filename
                Body: file.buffer,
                ContentType: file.mimetype,
            };
    
        }
        else{
            uploadParams = {
                Bucket: 'solarwebsite-documents', // Your S3 bucket name
                Key: `Investors-Relation/${category}/${itemsHeading}/${fileName}`, // Generate unique filename
                Body: file.buffer,
                ContentType: file.mimetype,
            };
        }
       
        const parallelUpload = new Upload({
            client: s3,
            params: uploadParams,
        });

        const s3UploadResult = await parallelUpload.done();
        const fileUrl = s3UploadResult.Location;
        const s3FilePath = decodeURIComponent(fileUrl.split('amazonaws.com/')[1]);
        console.log(s3FilePath,"here is the path")
        // Update the JSON structure with new file info
        const categoryData = data[category];

        if (!Array.isArray(categoryData)) {
            return res.status(400).send('Invalid data structure: category should be an array');
        }

        let folderFound = false;
        for (const categoryItem of categoryData) {
            if (categoryItem.title === folderName) {
                categoryItem.items[0].details.unshift({
                    title: fileName,
                    url: `${decodeURIComponent(s3FilePath)}`, // Decoded URL
                    type: file.mimetype,
                })
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
            // console.log('Updated data:', JSON.stringify(data, null, 2));
             
            console.log("File uploaded and JSON updated successfully.");
            res.status(200).send('File uploaded and JSON updated successfully');
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while uploading the file.');
    }
})
.post('/delete-file', async (req, res) => {
  const { folderName, itemsHeading, category, fileName } = req.body;

  if (!folderName || !itemsHeading || !category || !fileName) {
      return res.status(400).send('All parameters (folderName, itemsHeading, category, fileName) are required');
  }

  try {
      // Generate S3 file path
      let fileKey;
      if (itemsHeading !== folderName) {
          fileKey = `Investors-Relation/${category}/${folderName}/${itemsHeading}/${fileName}`;
      } else {
          fileKey = `Investors-Relation/${category}/${itemsHeading}/${fileName}`;
      }

      // Delete file from S3
      const deleteParams = {
          Bucket: 'solarwebsite-documents',
          Key: fileKey
      };

      await s3.deleteObject(deleteParams).promise();
      console.log(`${fileName} deleted from S3`);

      // Update the JSON structure by removing the file info
      const categoryData = data[category];

      if (!Array.isArray(categoryData)) {
          return res.status(400).send('Invalid data structure: category should be an array');
      }

      let folderFound = false;
      for (const categoryItem of categoryData) {
          if (categoryItem.title === folderName) {
              categoryItem.items.forEach((item) => {
                  if (item.heading === itemsHeading) {
                      const fileIndex = item.details.findIndex(detail => detail.title === fileName);

                      if (fileIndex > -1) {
                          item.details.splice(fileIndex, 1); // Remove the file entry from details
                          console.log(`File entry ${fileName} removed from JSON`);
                      } else {
                          return res.status(404).send('File not found in JSON structure');
                      }
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
          console.log("File deleted and JSON updated successfully.");
          res.status(200).send('File deleted and JSON updated successfully');
      });

  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred while deleting the file.');
  }
});



module.exports = sustainabilityRouter;
