const express = require("express");
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

// S3 configuration
const s3 = new S3Client({ region: 'ap-south-1' });
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Path to the JSON file
const dataPath = path.join(__dirname, '../data/bod.json');

// Helper function to read data
const readData = async () => {
  return fs.promises.readFile(dataPath, 'utf8');
};

// Helper function to write data
const writeData = async (data) => {
  return fs.promises.writeFile(dataPath, JSON.stringify(data, null, 2));
};

// POST: Add a new director
router.post("/", upload.single("img"), async (req, res) => {
  const { name, position, desc } = req.body;
  const file = req.file;

  try {
    let fileUrl = "";

    if (file) {
      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `directors/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const parallelUpload = new Upload({
        client: s3,
        params: uploadParams,
      });

      const s3UploadResult = await parallelUpload.done();
      fileUrl = `https://solarwebsite-documents/${uploadParams.Key}`;
    }

    let data = JSON.parse(await readData());
    const newDirector = {
      id: data.length + 1,
      img: fileUrl,
      name,
      position,
      desc,
    };

    data.push(newDirector);
    await writeData(data);

    res.status(200).json({ message: "Director added successfully!", data: newDirector });
  } catch (error) {
    res.status(500).json({ error: "Failed to add director." });
  }
});

// GET: Retrieve all directors
router.get("/", async (req, res) => {
  try {
    const data = JSON.parse(await readData());
    // console.log(data);
    res.status(200).json({ directors: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve directors." });
  }
});

// DELETE: Delete a director by ID
router.delete("/:id", async (req, res) => {
  const directorId = parseInt(req.params.id, 10);
  console.log(directorId,"here is the id");
  try {
    let data = JSON.parse(await readData());
    const directorIndex = data.findIndex(d => d.id === directorId);

    if (directorIndex === -1) {
      return res.status(404).json({ error: "Director not found." });
    }

    const director = data[directorIndex];
    if (director.img) {
      const fileName = director.img.split("/").pop();

      const deleteParams = {
        Bucket: "solarwebsite-documents",
        Key: `directors/${fileName}`,
      };

      await s3.send(new DeleteObjectCommand(deleteParams));
    }

    data.splice(directorIndex, 1);
    await writeData(data);

    res.status(200).json({ message: "Director deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete director." });
  }
});

// PUT: Update an existing director
router.put("/:id", upload.single("img"), async (req, res) => {
  const directorId = parseInt(req.params.id, 10);
  const { name, position, desc } = req.body;
  const file = req.file;

  try {
    // Read and parse existing data
    let data = JSON.parse(await readData());
    const director = data.find(d => d.id === directorId);

    if (!director) {
      return res.status(404).json({ error: "Director not found." });
    }

    // Handle file upload
    if (file) {
      if (director.img && director.img.includes("https")) {
        console.log("Deleting existing image from S3");
        const oldFileName = director.img.split("/").pop();

        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: "solarwebsite-documents",
              Key: `directors/${oldFileName}`,
            })
          );
        } catch (deleteError) {
          console.error("Failed to delete old image:", deleteError);
          return res.status(500).json({ error: "Failed to delete old image." });
        }
      }

      const uploadParams = {
        Bucket: "solarwebsite-documents",
        Key: `directors/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const parallelUpload = new Upload({
          client: s3,
          params: uploadParams,
        });

        const s3UploadResult = await parallelUpload.done();
        const fileName = uploadParams.Key.split('/').pop();
        director.img = `https://solargroup.com/api/download-file?file=directors/${fileName}`;
      } catch (uploadError) {
        console.error("Failed to upload new image:", uploadError);
        return res.status(500).json({ error: "Failed to upload new image." });
      }
    }

    // Update director details
    director.name = name || director.name;
    director.position = position || director.position;
    director.desc = desc || director.desc;

    // Save updated data
    await writeData(data);

    res.status(200).json({ message: "Director updated successfully.", data: director });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update director." });
  }
});


module.exports = router;
