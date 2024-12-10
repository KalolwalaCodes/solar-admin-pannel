const multer = require('multer');
const express = require("express");
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const router = express.Router();
const s3 = new S3Client({ region: 'ap-south-1' });

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/', upload.single('file'), async (req, res) => {
    // Extract existing fields
    const { name, companyName, phone, email, address, message, queryType } = req.body;
    const file = req.file; // File is now optional
  
    // Map queryType value to its corresponding text (optional)
    const queryTypeMap = {
      '1': 'Purchase',
      '2': 'Marketing',
      '3': 'Investor Relations',
      '4': 'Export',
      '5': 'Employment'
    };
  
    const selectedQueryType = queryTypeMap[queryType] || 'Unknown';
  
    console.log(name, companyName, phone, email, address, message, selectedQueryType);
    
    try {
      let fileUrl = '';
      if (file) {
        // Upload file to S3 in 'user-data' folder
        const uploadParams = {
          Bucket: 'solarwebsite-documents', // Replace with your S3 bucket name
          Key: `user-data/${Date.now()}_${file.originalname}`, // Store file in 'user-data' folder
          Body: file.buffer,
          ContentType: file.mimetype,
        };
  
        const parallelUpload = new Upload({
          client: s3,
          params: uploadParams,
        });
  
        const s3UploadResult = await parallelUpload.done();
        fileUrl = s3UploadResult.Location;
        const x = fileUrl.split('amazonaws.com/')[1];
        console.log(x);
        console.log(s3UploadResult);
        console.log(fileUrl);
      }
  
      // Create or update Excel sheet
      const excelPath = path.join(__dirname, 'form_data.xlsx');
      let workbook;
  
      if (fs.existsSync(excelPath)) {
        workbook = xlsx.readFile(excelPath);
      } else {
        workbook = xlsx.utils.book_new();
        const sheet = xlsx.utils.json_to_sheet([]);
        xlsx.utils.book_append_sheet(workbook, sheet, 'Sheet1');
      }
  
      const sheet = workbook.Sheets['Sheet1'];
      const data = xlsx.utils.sheet_to_json(sheet);
  
      // Determine the next available ID
      const nextId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
  
      // Push new entry with the generated ID
      data.push({
        id: nextId, // Add the generated ID
        Name: name,
        CompanyName: companyName,
        Email: email,
        Message: message,
        Phone: phone,
        Address: address,
        QueryType: selectedQueryType, // Add Query Type
        FileLink: file ? `https://solargroup.com/api/download-file?file=${fileUrl.split('amazonaws.com/')[1]}` : '' // Only include FileLink if a file was uploaded
      });
  
      const updatedSheet = xlsx.utils.json_to_sheet(data);
      workbook.Sheets['Sheet1'] = updatedSheet;
      xlsx.writeFile(workbook, excelPath);
  
      res.status(200).send('Form data saved successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while processing your request.');
    }
  });
  
  router.get('/contact-us', (req, res) => {
    const excelPath = path.join(__dirname, 'form_data.xlsx');
    try {
      // Read the Excel file
      const workbook = xlsx.readFile(excelPath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Convert the Excel sheet to JSON format
      const jsonData = xlsx.utils.sheet_to_json(sheet);
        
      // Send JSON data as response
      console.log(jsonData,"here is the data for excel and sending request");
      res.json(jsonData);
    } catch (error) {
      res.status(500).send('Error reading the Excel file');
    }
  });
  router.delete('/contact-us/:id', async (req, res) => {
    console.log(".................................")
    console.log("i'm delting called",req.params);
    const { id } = req.params; // Extract the ID from the request parameters
    const excelPath = path.join(__dirname, 'form_data.xlsx');

    try {
        // Check if the Excel file exists
        if (!fs.existsSync(excelPath)) {
            return res.status(404).send('Excel file not found');
        }

        const workbook = xlsx.readFile(excelPath);
        const sheet = workbook.Sheets['Sheet1'];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Find the index of the row to delete
        const index = data.findIndex(row => row.id === parseInt(id)); // Ensure ID is compared as a number

        if (index !== -1) {
            // Remove the row from the array
            data.splice(index, 1);
            
            // Update the Excel sheet with the modified data
            const updatedSheet = xlsx.utils.json_to_sheet(data);
            workbook.Sheets['Sheet1'] = updatedSheet;
            xlsx.writeFile(workbook, excelPath);

            res.status(200).send('Row deleted successfully');
        } else {
            res.status(404).send('Row not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

 module.exports = router;