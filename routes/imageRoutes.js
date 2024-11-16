const express = require('express');
const multer = require('multer');
const path = require('path');
const { detectFace } = require('../services/faceService');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Directory for uploaded files
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Route to detect face and extract attributes
router.post('/detect', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  try {
    // Detect face using the uploaded image
    const faceData = await detectFace(req.file.path);

    if (!faceData.faces || faceData.faces.length === 0) {
      return res.status(404).json({ message: 'No face detected in the image' });
    }

    // Extract attributes of the first detected face
    const faceAttributes = faceData.faces[0].attributes;

    res.status(200).json({
      message: 'Face detected successfully',
      faceAttributes, // Include the extracted attributes in the response
    });
  } catch (error) {
    console.error('Error detecting face:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
