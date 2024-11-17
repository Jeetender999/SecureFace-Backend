const express = require('express');
const multer = require('multer');
const path = require('path');
const { detectFace, matchFace } = require('../services/faceService');

const User = require('../models/User');
const Visitor = require('../models/Visitor');


const { default: axios } = require('axios');

const router = express.Router();

const FACE_API_URL = 'https://api-us.faceplusplus.com/facepp/v3';

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



// Route to register a new user
router.post('/register', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const { name, age, gender } = req.body;

  if (!name || !age || !gender) {
    return res.status(400).json({ error: 'Name, age, and gender are required' });
  }

  try {
    // Detect face and get the unique face token
    const faceData = await detectFace(req.file.path);

    if (!faceData.faces || faceData.faces.length === 0) {
      return res.status(400).json({ error: 'No face detected in the image' });
    }

    const faceId = faceData.faces[0].face_token;

        // Add face token to FaceSet
        await axios.post(`${FACE_API_URL}/faceset/addface`, null, {
            params: {
              api_key: process.env.FACE_API_KEY,
              api_secret: process.env.FACE_API_SECRET,
              faceset_token: process.env.FACESET_TOKEN,
              face_tokens: faceId,
            },
          });

    // Save user in the database
    const newUser = new User({
      name,
      age,
      gender,
      faceId,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ error: error.message });
  }
});



// Route to detect and match a face
router.post('/match', upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
  
    try {
      // Use Face++ Search API to match the face
      const matchData = await matchFace(req.file.path);
  
      if (matchData.results && matchData.results.length > 0) {
        const bestMatch = matchData.results[0];
        const confidenceThreshold = 85; // Confidence threshold
  
        if (bestMatch.confidence >= confidenceThreshold) {
          const faceToken = bestMatch.face_token;
  
          // Check if the face token exists in the registered user database
          const user = await User.findOne({ faceId: faceToken });
  
          if (user) {
            // If matched, fetch emotion details
            const faceData = await detectFace(req.file.path);
            const emotion = faceData.faces[0].attributes.emotion;
  
            const dominantEmotion = Object.keys(emotion).reduce((a, b) =>
              emotion[a] > emotion[b] ? a : b
            );
  
            // Return the user's details with emotion
            return res.status(200).json({
              message: 'User matched successfully',
              user,
              currentEmotion: dominantEmotion,
            });
          }
        }
      }
  
      // If no valid match, detect face and treat as a visitor
      const faceData = await detectFace(req.file.path);
  
      if (!faceData.faces || faceData.faces.length === 0) {
        return res.status(400).json({ error: 'No face detected in the image' });
      }
  
      const faceAttributes = faceData.faces[0].attributes;
      const emotion = faceAttributes.emotion;
  
      const dominantEmotion = Object.keys(emotion).reduce((a, b) =>
        emotion[a] > emotion[b] ? a : b
      );
  
      // Save the visitor details to the database
      const visitor = new Visitor({
        name: 'Stranger',
        age: faceAttributes.age.value,
        gender: faceAttributes.gender.value,
        emotion,
        currentEmotion: dominantEmotion, // Save the dominant emotion
      });
  
      const savedVisitor = await visitor.save();
  
      // Return visitor details with emotion
      res.status(200).json({
        message: 'No match found. Visitor treated as Stranger',
        visitor: savedVisitor,
      });
    } catch (error) {
      console.error('Error matching face:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

///// Just to test TESTING API}



// Test route to add dummy user
router.get('/test-add-user', async (req, res) => {
  try {
    const user = new User({
      name: 'John Doe',
      age: 30,
      gender: 'Male',
      faceId: 'unique_face_token',
    });
    const savedUser = await user.save();
    res.status(200).json({ message: 'User saved successfully', user: savedUser });
  } catch (error) {
    console.error('Error saving user:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Test route to add dummy visitor
router.get('/test-add-visitor', async (req, res) => {
  try {
    const visitor = new Visitor({
      age: 25,
      gender: 'Female',
      emotion: { happiness: 85, sadness: 5 },
    });
    const savedVisitor = await visitor.save();
    res.status(200).json({ message: 'Visitor saved successfully', visitor: savedVisitor });
  } catch (error) {
    console.error('Error saving visitor:', error.message);
    res.status(500).json({ error: error.message });
  }
});
// * Just to test


/// TESTING FACESET
const { createFaceSet } = require('../services/faceService');


// Route to create FaceSet
router.get('/create-faceset', async (req, res) => {
  try {
    console.log("FaceSet test")
    const faceSetData = await createFaceSet();
    res.status(200).json({
      message: 'FaceSet created successfully',
      faceSet: faceSetData,
    });
  } catch (error) {
    console.error('Error creating FaceSet:', error.message);
    res.status(500).json({ error: error.message });
  }
});


// Get list of FaceSet i.e face_tokens stored in FaceSet

router.get('/list-faces', async (req, res) => {
    try {
      const response = await axios.post(`${FACE_API_URL}/faceset/getdetail`, null, {
        params: {
          api_key: process.env.FACE_API_KEY,
          api_secret: process.env.FACE_API_SECRET,
          faceset_token: process.env.FACESET_TOKEN,
        },
      });
  
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error listing FaceSet details:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
