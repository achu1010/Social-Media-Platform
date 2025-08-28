const express = require('express');
const path = require('path');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

const router = express.Router();

// Upload single image
router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple images (for posts with multiple images)
router.post('/images', auth, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      filename: file.filename
    }));
    
    res.json({
      message: 'Files uploaded successfully',
      files: fileUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

module.exports = router;
