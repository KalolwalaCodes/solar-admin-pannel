const express = require("express");
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const {authenticateJWT}=require("../Controllers/auth")
// S3 configuration
const s3 = new S3Client({ region: 'ap-south-1' });
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Path to the JSON file
const dataPathOfIndustrial = path.join(__dirname, '../data/industrialproduct.json');
const dataPathOfDefense = path.join(__dirname, '../data/defense.json');
// Helper function to read and write JSON data
const updateJSONFile = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Load the existing JSON data industrial
let dataIndustrialProducts;
try {
    dataIndustrialProducts = require(dataPathOfIndustrial); // Load the JSON data
} catch (error) {
  console.error("Error loading JSON file: ", error.message);
}
const cacheDir = path.join(__dirname, 'cache');

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

// Load the existing JSON data defense
let dataDefenseProducts;
try {
    dataDefenseProducts = require(dataPathOfDefense); // Load the JSON data
} catch (error) {
  console.error("Error loading JSON file: ", error.message);
}

const writeData = async (data,dataPathOfProducts) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(dataPathOfProducts, JSON.stringify(data, null, 2), "utf8", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Helper function to read and write JSON data
const readData = async (dataPathOfProducts) => {
  return new Promise((resolve, reject) => {
    fs.readFile(dataPathOfProducts, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};


// GET request to retrieve committees
router.get('/industrial-data', async(req, res) => {
  // console.log("sending data", dataIndustrialProducts);
  const data = JSON.parse(await readData(dataPathOfIndustrial));
    if (!data) {
    return res.status(500).json({ msg: "Error loading data" });
  }
  res.setHeader('Cache-Control', 'no-store');
  res.json(data);
});



// POST: Add new industrial product (handling both image and PDF)
router.post('/industrial-data',authenticateJWT, upload.fields([{ name: "image", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), async (req, res) => {
  const { category, title,description } = req.body;
  const imageFile = req.files['image'] ? req.files['image'][0] : null;
  const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;

  try {
    let imageUrl = "";
    let url = "";

    // Upload image to S3 if provided
    if (imageFile) {
      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `products/images/${Date.now()}_${imageFile.originalname}`,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
      };

      const parallelUpload = new Upload({
        client: s3,
        params: uploadParams,
      });

      await parallelUpload.done();
      // Extract the filename for use in the URL
      const fileName = uploadParams.Key.split('/').pop(); // Get just the filename
      imageUrl = `https://solargroup.com/api/download-file?file=products/images/${fileName}`; // Create the URL
      // imageUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
    }

    // Upload PDF to S3 if provided
    if (pdfFile) {
      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `products/pdfs/${pdfFile.originalname}`,
        Body: pdfFile.buffer,
        ContentType: pdfFile.mimetype,
      };

      const parallelUpload = new Upload({
        client: s3,
        params: uploadParams,
      });

      await parallelUpload.done();
      url = `products/pdfs/${pdfFile.originalname}`;
    }

    // Create new product
    const data = JSON.parse(await readData(dataPathOfIndustrial));
    const newProduct = {
      id: data.length + 1,
      category,
      title,
      url,
      imageUrl,
      description
    };

    data.push(newProduct);
    await writeData(data, dataPathOfIndustrial);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to add product." });
  }
});

// PUT: Update industrial product (handling both image and PDF)
router.put('/industrial-data',authenticateJWT, upload.fields([{ name: "image", maxCount: 1 }, { name: "pdf", maxCount: 1 }]), async (req, res) => {
  const { category, title ,id,description} = req.body;
  console.log("here is the data--------",category, title);
  const imageFile = req.files['image'] ? req.files['image'][0] : null;
  const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;

  try {
    const data = JSON.parse(await readData(dataPathOfIndustrial));
    const productIndex = data.findIndex((product) => product.id === parseInt(id, 10));

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    let imageUrl = data[productIndex].imageUrl;
    let url = data[productIndex].url;

    // Upload new image to S3 if provided
    if (imageFile) {
      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `products/images/${Date.now()}_${imageFile.originalname}`,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
      };

      const parallelUpload = new Upload({
        client: s3,
        params: uploadParams,
      });

      await parallelUpload.done();
      const fileName = uploadParams.Key.split('/').pop(); // Get just the filename
      imageUrl = `https://solargroup.com/api/download-file?file=products/images/${fileName}`; // Create the URL
    }

    // Upload new PDF to S3 if provided
    if (pdfFile) {
      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `products/pdfs/${pdfFile.originalname}`,
        Body: pdfFile.buffer,
        ContentType: pdfFile.mimetype,
      };

      const parallelUpload = new Upload({
        client: s3,
        params: uploadParams,
      });

      await parallelUpload.done();
      url = `products/pdfs/${pdfFile.originalname}`;
    }

    // Update product
    data[productIndex] = {
      ...data[productIndex],
      category,
      title,
      url,
      imageUrl,
      description
    };

    await writeData(data, dataPathOfIndustrial);

    const newData = JSON.parse(await readData(dataPathOfIndustrial));
    res.json(newData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update product." });
  }
});

// DELETE: Delete a product by title (handling both image and PDF)
router.delete('/industrial-data',authenticateJWT, async (req, res) => {
  const { id } = req.query; // Assume title is passed as a query parameter

  try {
    const data = JSON.parse(await readData(dataPathOfIndustrial));
    const productIndex = data.findIndex((product) =>product.id === parseInt(id, 10));
    
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const deletedProduct = data.splice(productIndex, 1);

    // Delete image from S3 if it exists
    if (deletedProduct[0].imageUrl) {
      const imageUrl = deletedProduct[0].imageUrl;
      const imageKeyMatch = imageUrl.match(/\.com\/(.+)/);
      const imageKey = imageKeyMatch ? imageKeyMatch[1] : null;

      if (imageKey) {
        await s3.send(new DeleteObjectCommand({
          Bucket: "solarwebsite-documents",
          Key: imageKey,
        }));
      }
    }

    // Delete PDF from S3 if it exists
    if (deletedProduct[0].url) {
      const pdfUrl = deletedProduct[0].url;
      const pdfKeyMatch = pdfUrl.match(/\.com\/(.+)/);
      const pdfKey = pdfKeyMatch ? pdfKeyMatch[1] : null;

      if (pdfKey) {
        await s3.send(new DeleteObjectCommand({
          Bucket: "solarwebsite-documents",
          Key: pdfKey,
        }));
      }
    }

    // Write updated data back
    await writeData(data, dataPathOfIndustrial);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
});



// GET request to retrieve committees
router.get('/defense-data', async(req, res) => {
  const data = JSON.parse(await readData(dataPathOfDefense));

  if (!data) {
    return res.status(500).json({ msg: "Error loading data" });
  }
  res.setHeader('Cache-Control', 'no-store');
  res.json(data);
});


router.post("/defense-data", authenticateJWT, upload.fields([{ name: "image" }, { name: "pdf" }]), async (req, res) => {
  const { category, title,description } = req.body;
  const files = req.files;

  try {
    let imageUrl = "";
    let url = "";

    // Upload image to S3 if provided
    if (files.image && files.image[0]) {
      const image = files.image[0];
      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `products/images/${Date.now()}_${image.originalname}`,
        Body: image.buffer,
        ContentType: image.mimetype,
      };

      const parallelUpload = new Upload({
        client: s3,
        params: uploadParams,
      });

      const s3UploadResult = await parallelUpload.done();
      const fileName = uploadParams.Key.split('/').pop(); // Get just the filename
      imageUrl = `https://solargroup.com/api/download-file?file=products/images/${fileName}`; // Create the URL
    }

    // Upload PDF to S3 if provided
    if (files.pdf && files.pdf[0]) {
      const pdf = files.pdf[0];
      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `products/pdfs/${pdf.originalname}`,
        Body: pdf.buffer,
        ContentType: pdf.mimetype,
      };

      const parallelUpload = new Upload({
        client: s3,
        params: uploadParams,
      });

      const s3UploadResult = await parallelUpload.done();
      url = `products/pdfs/${pdf.originalname}`;
    }

    // Create new product
    const data = JSON.parse(await readData(dataPathOfDefense));
    const newProduct = {
      id: data.length + 1,
      category,
      title,
      url,
      imageUrl,
      description:[description]
    };

    data.push(newProduct);
    await writeData(data, dataPathOfDefense);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product." });
  }
});

router.put(
  "/defense-data",
  authenticateJWT,
  upload.fields([{ name: "image" }, { name: "pdf" }]),
  async (req, res) => {
    const { category, title, id,description } = req.body;
    console.log(category, title, id,description,"the data is ");
    const files = req.files;

    try {
      const data = JSON.parse(await readData(dataPathOfDefense));
      const productIndex = data.findIndex((product) => product.id === parseInt(id, 10));

      if (productIndex === -1) {
        return res.status(404).json({ error: "Product not found" });
      }

      let imageUrl = data[productIndex].imageUrl;
      let url = data[productIndex].url;

      // Upload new image to S3 if provided
      if (files.image && files.image[0]) {
        const image = files.image[0];
        const uploadParams = {
          Bucket: "solarwebsite-documents",
          Key: `products/images/${Date.now()}_${image.originalname}`,
          Body: image.buffer,
          ContentType: image.mimetype,
        };

        const parallelUpload = new Upload({
          client: s3,
          params: uploadParams,
        });

        await parallelUpload.done();
        const fileName = uploadParams.Key.split('/').pop();
        imageUrl = `https://solargroup.com/api/download-file?file=products/images/${fileName}`;
      }

      // Upload new PDF to S3 if provided
      if (files.pdf && files.pdf[0]) {
        const pdf = files.pdf[0];
        const uploadParams = {
          Bucket: "solarwebsite-documents",
          Key: `products/pdfs/${Date.now()}_${pdf.originalname}`,
          Body: pdf.buffer,
          ContentType: pdf.mimetype,
        };

        const parallelUpload = new Upload({
          client: s3,
          params: uploadParams,
        });

        await parallelUpload.done();
        const fileName = uploadParams.Key.split('/').pop();
        url = `products/pdfs/${fileName}`;
      }

      // Update the product
      data[productIndex] = {
        ...data[productIndex],
        category,
        title,
        url,
        imageUrl,
        description:[description]
      };

      await writeData(data, dataPathOfDefense);
      const newData = JSON.parse(await readData(dataPathOfDefense));
      res.json(newData);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product." });
    }
  }
);


router.delete("/defense-data",authenticateJWT, async (req, res) => {
  const { id } = req.query;
  console.log(id,"the id is");
  try {
    const data = JSON.parse(await readData(dataPathOfDefense));
    const productIndex = data?.findIndex((product) => product.id === parseInt(id, 10));

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const deletedProduct = data.splice(productIndex, 1);

    // Delete image from S3 if exists
    if (deletedProduct[0].imageUrl) {
      const imageUrl = deletedProduct[0].imageUrl;
      const imageKeyMatch = imageUrl.match(/\.com\/(.+)/);
      const imageKey = imageKeyMatch ? imageKeyMatch[1] : null;

      if (imageKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: "solarwebsite-documents",
            Key: imageKey,
          })
        );
      }
    }

    // Delete PDF from S3 if exists
    if (deletedProduct[0].url) {
      const pdfUrl = deletedProduct[0].url;
      const pdfKeyMatch = pdfUrl.match(/\.com\/(.+)/);
      const pdfKey = pdfKeyMatch ? pdfKeyMatch[1] : null;

      if (pdfKey) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: "solarwebsite-documents",
            Key: pdfKey,
          })
        );
      }
    }

    await writeData(data, dataPathOfDefense);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
});


router.get('/pdf/:fileKey',authenticateJWT, async (req, res) => {
  const fileKey = req.params.fileKey;

  const fetchFileFromS3 = async (bucketName, fileKey) => {
      const headParams = { Bucket: bucketName, Key: fileKey };

      try {
          // Check if file exists on S3
          await s3.send(new HeadObjectCommand(headParams));

          const filePath = path.join(cacheDir, fileKey.replace(/\//g, '_')); // Cache-safe filename

          // Check if cached
          if (fs.existsSync(filePath)) {
              return filePath;
          }

          // Download from S3
          const getObjectParams = { Bucket: bucketName, Key: fileKey };
          const data = await s3.send(new GetObjectCommand(getObjectParams));
          const writeStream = fs.createWriteStream(filePath);

          return new Promise((resolve, reject) => {
              data.Body.pipe(writeStream);
              writeStream.on('finish', () => resolve(filePath));
              writeStream.on('error', (err) => reject(err));
          });
      } catch (err) {
          console.error(`Error fetching file from S3:`, err);
          throw err;
      }
  };

  try {
      const bucketName = 'solarwebsite-documents';
      const decodedFileKey = decodeURIComponent(fileKey);
      console.log(`Attempting to fetch file: ${decodedFileKey}`); // Add logging
      const filePath = await fetchFileFromS3(bucketName, decodedFileKey);

      res.sendFile(filePath, (err) => {
          if (err) {
              console.error('Error sending file:', err);
              if (!res.headersSent) {
                  res.status(500).send('Failed to send file');
              }
          }
      });
  } catch (error) {
    console.log(error);
      res.status(500).send('Failed to fetch file');
  }
});



module.exports = router;
