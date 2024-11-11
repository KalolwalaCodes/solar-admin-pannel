const express = require("express");
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const {readNewsData}=require('./helper01');

const path = require('path');

// S3 configuration
const s3 = new S3Client({ region: 'ap-south-1' });
const storage = multer.memoryStorage(); // Store the file in memory for easy S3 upload
const upload = multer({ storage });

// Path to the JSON file
const dataPath = path.join(__dirname, '../data/news.json');

// Load the existing JSON data
let data;


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
get('/', async(req, res) => {
    try {
      const jsonString = await readNewsData(); // Read the file asynchronously
      data = JSON.parse(jsonString); // Parse the JSON data
        res.status(200).json(data); // Send the news data in the response

    } catch (error) {
      console.error("Error fetching news data:", error);
      res.status(500).json({ error: 'An error occurred while fetching the news data.' });
    }
  })
.delete('/:id', async (req, res) => {
    const newsId = parseInt(req.params.id, 10); // Get news ID from request parameters
    
    try {
      // Read the existing news data
      fs.readFile(dataPath, 'utf8', async (err, fileData) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to read data' });
        }
  
        let newsData = JSON.parse(fileData);
        const newsItemIndex = newsData.news.findIndex(news => news.id === newsId);
  
        // If the news item doesn't exist, return an error
        if (newsItemIndex === -1) {
          return res.status(404).json({ error: 'News item not found' });
        }
  
        const newsItem = newsData.news[newsItemIndex];
        
        // Check if the news item has a thumbnail URL and delete the file from S3
        if (newsItem.thumbnail && newsItem.thumbnail.includes('news-thumbnails')) {
          const fileName = newsItem.thumbnail.split('file=news-thumbnails/')[1]; // Extract the file name from the URL
  
          const deleteParams = {
            Bucket: 'solarwebsite-documents', // Replace with your S3 bucket name
            Key: `news-thumbnails/${fileName}`, // Path to the file in S3
          };
  
          try {
            // Delete the file from S3
            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3.send(deleteCommand);
            console.log('S3 file deleted successfully');
          } catch (s3Error) {
            console.error('Error deleting file from S3:', s3Error);
            return res.status(500).json({ error: 'Failed to delete thumbnail from S3' });
          }
        }
  
        // Remove the news item from the array
        newsData.news.splice(newsItemIndex, 1);
  
        // Write the updated data back to the JSON file
        fs.writeFile(dataPath, JSON.stringify(newsData, null, 2), (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to write updated data' });
          }
  
          res.status(200).json({ message: 'News item deleted successfully!' });
        });
      });
    } catch (error) {
      console.error("Error processing delete request:", error);
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
  })
  
  .put('/update', upload.single('thumbnail'), async (req, res) => {
    const { id, headline, shortNews, date, link, showOnHomepage, showOnNewspage } = req.body;
    console.log(id, headline, shortNews, date, link, showOnHomepage, showOnNewspage)
    const file = req.file;
  
    try {
      // Read the existing news data
      fs.readFile(dataPath, 'utf8', async (err, fileData) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to read data' });
        }
  
        let newsData = JSON.parse(fileData);
        const newsItem = newsData.news.find(item => item.id === parseInt(id));
  
        if (!newsItem) {
          return res.status(404).json({ error: 'News item not found' });
        }
  
        let fileUrl = newsItem.thumbnail; // Retain the old thumbnail if no new file is uploaded
  
        // Upload new thumbnail to S3 if it exists
        if (file) {
          const uploadParams = {
            Bucket: 'solarwebsite-documents', // Your S3 bucket name
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
  
        // Update the news item with new data
        newsItem.headline = headline || newsItem.headline;
        newsItem.shortNews = shortNews || newsItem.shortNews;
        newsItem.date = date || newsItem.date;
        newsItem.link = link || newsItem.link;
        newsItem.thumbnail = fileUrl; // Use the new thumbnail URL if uploaded
        newsItem.showOnHomepage = showOnHomepage === 'true';
        newsItem.showOnNewspage = showOnNewspage === 'true';
  
        // Write updated data back to the JSON file
        fs.writeFile(dataPath, JSON.stringify(newsData, null, 2), (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update data' });
          }
  
          res.status(200).json({ message: 'News updated successfully!', data: newsItem });
        });
      });
    } catch (error) {
      console.error("Error uploading to S3 or updating JSON:", error);
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
  });
  
  

module.exports = router;
