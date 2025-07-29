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

Choose your preferred setup method:

### Option 1: Docker Setup (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- At least 4GB available RAM (for OCR model loading)
- Ports 3000, 3001, and 8001 available

#### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/vivekbisen04/MVP.git
   cd MVP
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

### Option 2: Manual Setup (Without Docker)

#### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- At least 4GB available RAM

#### Backend Setup
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

#### OCR Service Setup
```bash
cd ocr-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
# Runs on http://localhost:8001
```

#### Environment Variables
Create these files for manual setup:

**backend/.env**
```
PORT=3001
OCR_SERVICE_URL=http://localhost:8001
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

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
