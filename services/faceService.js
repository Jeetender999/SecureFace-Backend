const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Base URL for Face++ API
const FACE_API_URL = 'https://api-us.faceplusplus.com/facepp/v3';

/**
 * Detect face attributes from an image
 * @param {string} imagePath - Path to the image file
 * @returns {Object} - Face detection results
 */
async function detectFace(imagePath) {
  try {
    // Create a FormData object to send image and API keys
    const formData = new FormData();
    formData.append('api_key', process.env.FACE_API_KEY); // Face++ API Key
    formData.append('api_secret', process.env.FACE_API_SECRET); // Face++ API Secret
    formData.append('image_file', fs.createReadStream(imagePath)); // Image file stream
    formData.append('return_attributes', 'gender,age,emotion'); // Request specific attributes

    // Send POST request to Face++ API
    const response = await axios.post(`${FACE_API_URL}/detect`, formData, {
      headers: formData.getHeaders(),
    });

    return response.data; // Return API response data
  } catch (error) {
    console.error('Error detecting face:', error.message);
    throw new Error('Failed to detect face.');
  }
}

module.exports = { detectFace };
