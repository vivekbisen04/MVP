from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import easyocr
import cv2
import numpy as np
import re
from PIL import Image
import io
import logging

# Force CPU-only mode
os.environ['CUDA_VISIBLE_DEVICES'] = ''

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Receipt OCR Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR with CPU-only mode
reader = easyocr.Reader(['en'], gpu=False)

def preprocess_image(image_bytes):
    """Preprocess image for better OCR results"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
        
        # Convert PIL to OpenCV format
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoising(gray)
        
        # Increase contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)
        
        return enhanced
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        return None

def extract_merchant_name(text_lines):
    """Extract merchant name from OCR text"""
    # Common patterns that indicate merchant names
    merchant_patterns = [
        r'^[A-Z][A-Z\s&]+$',  # All caps company names
        r'^[A-Z][a-zA-Z\s&\-\']+(?:\s(?:Inc|LLC|Corp|Co|Ltd)\.?)?$',  # Proper company names
    ]
    
    # Look at first few lines for merchant name
    for i, line in enumerate(text_lines[:5]):
        line = line.strip()
        if len(line) < 3 or len(line) > 50:  # Filter out very short/long lines
            continue
            
        # Skip common receipt headers
        skip_patterns = [
            r'receipt|invoice|bill|order|ticket',
            r'^\d+$',  # Pure numbers
            r'^[\d\-/\s:]+$',  # Dates/times
            r'thank\s*you|thanks',
            r'customer\s*copy'
        ]
        
        if any(re.search(pattern, line, re.IGNORECASE) for pattern in skip_patterns):
            continue
            
        # Check if line matches merchant patterns
        for pattern in merchant_patterns:
            if re.match(pattern, line, re.IGNORECASE):
                return line
    
    # Fallback: return first meaningful line
    for line in text_lines[:3]:
        line = line.strip()
        if len(line) >= 3 and not re.match(r'^[\d\-/\s:]+$', line):
            return line
    
    return "Unknown Merchant"

def extract_total_amount(text_lines):
    """Extract total amount from OCR text"""
    # Common total patterns
    total_patterns = [
        r'total[:\s]*\$?(\d+\.?\d*)',
        r'amount[:\s]*\$?(\d+\.?\d*)',
        r'due[:\s]*\$?(\d+\.?\d*)',
        r'balance[:\s]*\$?(\d+\.?\d*)',
        r'\$(\d+\.\d{2})\s*$',  # Dollar amount at end of line
    ]
    
    # Look through all lines for total amount
    found_amounts = []
    
    for line in text_lines:
        line = line.strip().lower()
        
        for pattern in total_patterns:
            matches = re.findall(pattern, line, re.IGNORECASE)
            for match in matches:
                try:
                    amount = float(match)
                    if 0.01 <= amount <= 9999.99:  # Reasonable range
                        found_amounts.append(amount)
                except ValueError:
                    continue
    
    # Return the largest reasonable amount found (likely the total)
    if found_amounts:
        return max(found_amounts)
    
    return 0.0

@app.post("/process-receipt")
async def process_receipt(file: UploadFile = File(...)):
    """Process receipt image and extract merchant and total"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Preprocess image
        processed_image = preprocess_image(image_data)
        if processed_image is None:
            raise HTTPException(status_code=400, detail="Unable to process image")
        
        # Perform OCR
        logger.info("Starting OCR processing...")
        results = reader.readtext(processed_image)
        
        # Extract text lines
        text_lines = [result[1] for result in results if result[2] > 0.3]  # Filter by confidence
        raw_text = '\n'.join(text_lines)
        
        logger.info(f"OCR extracted {len(text_lines)} lines of text")
        
        # Extract merchant and total
        merchant = extract_merchant_name(text_lines)
        total = extract_total_amount(text_lines)
        
        # Calculate confidence score (simplified)
        avg_confidence = sum(result[2] for result in results) / len(results) if results else 0
        confidence = min(avg_confidence * 100, 99)  # Convert to percentage, cap at 99%
        
        return {
            "merchant": merchant,
            "total": total,
            "confidence": round(confidence, 1),
            "raw_text": raw_text,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error processing receipt: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "OCR Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)