# Receipt Rewards MVP Demo

A full-stack demonstration application that allows users to upload receipt images, extract merchant information and totals using OCR, and earn reward points. Built as a technical showcase for a WhatsApp rewards app position.

## 🎯 Overview

This MVP demonstrates core functionality of a receipt rewards system:
- **Web Upload Interface**: Users can drag/drop or select receipt images
- **OCR Processing**: Python service extracts merchant name and total amount
- **Points System**: Users earn 25 points per successfully processed receipt
- **Dashboard**: View processed receipts and points balance
- **Full-Stack Integration**: Modern tech stack with containerized deployment

## 🏗️ Architecture

```
Web Frontend (Next.js) → Node.js API → Python OCR Service → SQLite Database
```

### Tech Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express and SQLite
- **OCR Service**: Python with FastAPI and EasyOCR
- **Database**: SQLite for simplicity
- **Containerization**: Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB available RAM (for OCR model loading)
- Ports 3000, 3001, and 8001 available

### Installation

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd receipt-rewards-demo
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Wait for services to initialize** (first run takes longer due to EasyOCR model download)

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - OCR Service: http://localhost:8001

### First Time Setup
The OCR service will download the EasyOCR model on first startup (~150MB). This may take a few minutes depending on your internet connection.

## 📱 How to Use

### Upload a Receipt
1. Go to http://localhost:3000
2. Click "Upload Receipt" tab
3. Drag and drop a receipt image or click to browse
4. Click "Process Receipt"
5. View extracted information and earned points

### View Dashboard
1. Click "Dashboard" tab
2. See your total points balance
3. Review all processed receipts
4. View statistics and receipt history

## 🔧 API Documentation

### Backend Endpoints

#### POST /api/receipts
Upload and process a receipt image
- **Input**: multipart/form-data with 'receipt' file
- **Output**: Receipt data with extracted information and points awarded

#### GET /api/receipts
Retrieve all processed receipts
- **Output**: Array of receipt objects with merchant, total, points, etc.

#### GET /api/points
Get current points balance
- **Output**: Total points earned

### OCR Service Endpoints

#### POST /process-receipt
Process receipt image with OCR
- **Input**: multipart/form-data with image file
- **Output**: Extracted merchant, total, confidence score, and raw text

## 🗄️ Database Schema

### receipts table
```sql
id INTEGER PRIMARY KEY
merchant TEXT
total_amount DECIMAL(10,2)
points_awarded INTEGER DEFAULT 25
processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
raw_ocr_text TEXT
confidence DECIMAL(5,2)
```

### points_ledger table
```sql
id INTEGER PRIMARY KEY
transaction_type TEXT DEFAULT 'earned'
amount INTEGER
receipt_id INTEGER REFERENCES receipts(id)
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

## 🧪 Testing

### Sample Receipts
Check the `sample-receipts/` directory for test data and patterns to create receipt images.

### Test Scenarios
1. **Valid Receipt**: Upload clear receipt image → Verify merchant and total extraction
2. **Duplicate Prevention**: Upload same receipt twice → Should reject duplicate
3. **Invalid Image**: Upload non-receipt image → Should handle gracefully
4. **Points Calculation**: Verify 25 points awarded per receipt

### Manual Testing
1. Create receipt images based on sample patterns
2. Test various receipt formats (grocery, restaurant, retail)
3. Verify OCR accuracy with different image qualities
4. Test dashboard refresh and data persistence

## 🛠️ Development Setup

### Running Services Individually

#### OCR Service
```bash
cd ocr-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```
PORT=3001
OCR_SERVICE_URL=http://localhost:8001
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔍 Technical Decisions

### OCR Implementation
- **EasyOCR**: Chosen for good accuracy without requiring Google Vision API keys
- **Text Processing**: Custom regex patterns for merchant and total extraction
- **Image Preprocessing**: OpenCV for image enhancement before OCR

### Database Choice
- **SQLite**: Simple setup, suitable for MVP demo
- **Schema Design**: Separate tables for receipts and points ledger for auditability

### Frontend Architecture
- **Next.js**: Modern React framework with TypeScript
- **Tailwind CSS**: Rapid UI development with consistent design
- **Component Structure**: Modular components for upload and dashboard

### Error Handling
- **OCR Failures**: Graceful fallback with user feedback
- **Duplicate Detection**: Basic merchant + amount matching within 1 hour
- **File Validation**: Image type and size restrictions

## 🐛 Troubleshooting

### Common Issues

**OCR Service Won't Start**
- Check available RAM (needs ~2GB for model)
- Verify Docker has sufficient memory allocation
- Check logs: `docker-compose logs ocr-service`

**Upload Fails**
- Verify all services are running
- Check image file size (max 10MB)
- Ensure image is valid format (JPG, PNG, HEIC)

**Dashboard Shows No Data**
- Check backend service connection
- Verify database file permissions
- Refresh the page

**Performance Issues**
- OCR processing takes 5-15 seconds per image (normal)
- First OCR request is slower due to model loading
- Consider image size reduction for faster processing

### Docker Issues
```bash
# Restart all services
docker-compose down && docker-compose up --build

# View logs
docker-compose logs [service-name]

# Access service shell
docker-compose exec [service-name] /bin/bash
```

## 📊 Performance Metrics

### Expected Performance
- **OCR Processing**: 3-10 seconds per receipt
- **API Response**: <1 second for data retrieval
- **Database Operations**: <100ms for standard queries
- **Memory Usage**: ~2GB for OCR service, ~500MB total for other services

## 🔒 Security Considerations

- File upload validation and size limits
- No sensitive data logging
- Input sanitization for OCR text
- Basic duplicate prevention

## 🚧 Future Enhancements

### Phase 2 Features
- User authentication and accounts
- Receipt image storage and retrieval
- Advanced duplicate detection
- Receipt categorization and analytics
- Rewards catalog and redemption
- Mobile app integration

### Technical Improvements
- Redis caching for faster responses
- PostgreSQL for production database
- Image compression and optimization
- Advanced OCR preprocessing
- API rate limiting and authentication
- Comprehensive test suite

## 📈 Scalability Considerations

- **OCR Service**: Can be horizontally scaled with load balancer
- **Database**: SQLite suitable for demo; PostgreSQL recommended for production
- **File Storage**: Consider cloud storage (S3) for receipt images
- **Caching**: Redis for frequently accessed data
- **Monitoring**: Add logging and metrics collection

## 🤝 Contributing

This is a demonstration project for a job application. The code is provided as-is for evaluation purposes.

## 📞 Support

For questions about this implementation, please refer to the code comments and this documentation. The project demonstrates full-stack development capabilities with modern technologies and best practices.

---

**Built with ❤️ as a technical demonstration**

*This MVP showcases proficiency in full-stack development, OCR integration, API design, modern frontend frameworks, and Docker containerization.*