const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase, dbHelpers } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8001';

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Receipt Rewards API' });
});

// Process new receipt
app.post('/api/receipts', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image provided' });
    }

    console.log('Processing receipt:', req.file.filename);

    // Send image to OCR service
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = new Blob([fileBuffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);

    let ocrResponse;
    try {
      ocrResponse = await axios.post(`${OCR_SERVICE_URL}/process-receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 second timeout
      });
    } catch (ocrError) {
      console.error('OCR service error:', ocrError.message);
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ 
        error: 'Failed to process receipt with OCR service',
        details: ocrError.message 
      });
    }

    const ocrData = ocrResponse.data;
    
    if (!ocrData.success) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'OCR processing failed' });
    }

    // Check for duplicate receipt
    const isDuplicate = await dbHelpers.checkDuplicateReceipt(
      ocrData.merchant, 
      ocrData.total
    );

    if (isDuplicate) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ 
        error: 'Duplicate receipt detected. Same merchant and amount processed recently.' 
      });
    }

    // Award points (25 points per receipt)
    const pointsAwarded = 25;

    // Insert receipt into database
    const receiptData = {
      merchant: ocrData.merchant,
      total_amount: ocrData.total,
      points_awarded: pointsAwarded,
      raw_ocr_text: ocrData.raw_text,
      confidence: ocrData.confidence
    };

    const receipt = await dbHelpers.insertReceipt(receiptData);

    // Insert points transaction
    await dbHelpers.insertPointsTransaction({
      transaction_type: 'earned',
      amount: pointsAwarded,
      receipt_id: receipt.id
    });

    // Clean up uploaded file (optional - you might want to keep for debugging)
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      receipt: {
        id: receipt.id,
        merchant: ocrData.merchant,
        total: ocrData.total,
        points_awarded: pointsAwarded,
        confidence: ocrData.confidence,
        processed_at: new Date().toISOString()
      },
      message: `Receipt processed successfully! +${pointsAwarded} points earned.`
    });

  } catch (error) {
    console.error('Error processing receipt:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Get all processed receipts
app.get('/api/receipts', async (req, res) => {
  try {
    const receipts = await dbHelpers.getAllReceipts();
    res.json({ receipts });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// Get current points balance
app.get('/api/points', async (req, res) => {
  try {
    const totalPoints = await dbHelpers.getTotalPoints();
    res.json({ total_points: totalPoints });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Failed to fetch points balance' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Receipt Rewards API server running on port ${PORT}`);
      console.log(`OCR Service URL: ${OCR_SERVICE_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();