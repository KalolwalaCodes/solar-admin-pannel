const express = require("express");
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');

// S3 configuration
const s3 = new S3Client({ region: 'ap-south-1' });
const storage = multer.memoryStorage(); // Store the file in memory for easy S3 upload
const upload = multer({ storage });

// Path to the JSON file
const dataPath = path.join(__dirname, '../data/news.json');

// Load the existing JSON data
let data;
try {
  data = require(dataPath); // Load the JSON data
} catch (error) {
  console.error("Error loading JSON file: ", error.message);
}

// POST route to handle news submission
router.post('/', upload.single('thumbnail'), async (req, res) => {
    const { headline, shortNews, date, link, showOnHomepage, showOnNewspage } = req.body;
    const file = req.file;
  
    try {
      let fileUrl = '';
  
      // Upload thumbnail to S3 if it exists
      if (file) {
        const uploadParams = {
          Bucket: 'solarwebsite-documents', // Replace with your S3 bucket name
          Key: `news-thumbnails/${Date.now()}_${file.originalname}`, // Save in 'news-thumbnails' folder with timestamp
          Body: file.buffer,
          ContentType: file.mimetype,
        };
  
        const parallelUpload = new Upload({
          client: s3,
          params: uploadParams,
        });
  
        // Wait for the upload to finish
        const s3UploadResult = await parallelUpload.done();
        
        // Extract the filename for use in the URL
        const fileName = uploadParams.Key.split('/').pop(); // Get just the filename
        fileUrl = `https://solargroup.com/api/download-file?file=news-thumbnails/${fileName}`; // Create the URL
      }
  
      // Create the new news item with the custom file URL
      const newNewsItem = {
        id: data.news.length + 1,
        thumbnail: fileUrl, // URL of the uploaded image in desired format
        headline,
        shortNews,
        date,
        link,
        showOnHomepage: showOnHomepage === 'true', // Convert to boolean
        showOnNewspage: showOnNewspage === 'true' // Convert to boolean
      };
  
      // Read the existing news data and append the new item
      fs.readFile(dataPath, 'utf8', (err, fileData) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to read data' });
        }
  
        let newsData = JSON.parse(fileData);
        newsData.news.push(newNewsItem); // Add the new item to the news array
  
        // Write updated data back to the JSON file
        fs.writeFile(dataPath, JSON.stringify(newsData, null, 2), (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to write data' });
          }
  
          res.status(200).json({ message: 'News added successfully!', data: newNewsItem });
        });
      });
    } catch (error) {
      console.error("Error uploading to S3 or updating JSON:", error);
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
  }).
get('/', (req, res) => {
    try {
      // Read the news data from the JSON file
  
        res.status(200).json(data); // Send the news data in the response

    } catch (error) {
      console.error("Error fetching news data:", error);
      res.status(500).json({ error: 'An error occurred while fetching the news data.' });
    }
  });

module.exports = router;
