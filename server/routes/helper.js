const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({ region: 'ap-south-1' });
const BUCKET_NAME = 'solarwebsite-documents'; // Your S3 bucket name

// Path to the superadmin.json file
const filePath = path.join(__dirname, '../data/superadmin.json');

// Upload the superadmin.json file to S3
const uploadSuperadmin = async () => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: BUCKET_NAME,
    Key: 'users/admin_data.json', // File name in the S3 bucket
    Body: fileContent,
    ContentType: 'application/json',
  };

  try {
    const command = new GetObjectCommand(params);
    await s3Client.send(command);
    console.log('Superadmin data uploaded successfully');
  } catch (error) {
    console.error('Error uploading superadmin data:', error);
  }
};

uploadSuperadmin();
