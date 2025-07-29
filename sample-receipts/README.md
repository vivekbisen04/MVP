# Sample Receipt Images

This directory contains sample receipt images for testing the Receipt Rewards MVP.

## Test Receipts

The following sample receipts are provided for testing:

1. **grocery-receipt.txt** - Text representation of a grocery store receipt
2. **restaurant-receipt.txt** - Text representation of a restaurant receipt  
3. **retail-receipt.txt** - Text representation of a retail store receipt

## How to Test

1. Create actual receipt images or use screenshots of receipts
2. Upload them through the web interface at http://localhost:3000
3. Verify the OCR correctly extracts merchant name and total amount
4. Check that 25 points are awarded per receipt

## Expected Results

The OCR service should be able to extract:
- **Merchant Name**: Usually found in the first few lines of the receipt
- **Total Amount**: Look for patterns like "Total: $XX.XX" or "Amount Due: $XX.XX"
- **Confidence Score**: Measure of OCR accuracy

## Sample Data

Use these text patterns to create test receipt images:

### Grocery Store Receipt
```
WHOLE FOODS MARKET
123 Main Street
Anytown, ST 12345

Organic Bananas         $3.99
Greek Yogurt           $5.49
Bread                  $2.99
Milk                   $4.29

Subtotal:             $16.76
Tax:                   $1.34
TOTAL:                $18.10

Thank you!
```

### Restaurant Receipt
```
PIZZA PALACE
456 Oak Avenue
Food City, ST 67890

Large Pepperoni Pizza  $18.95
Garlic Bread           $4.50
Soft Drinks (2)        $5.98

Subtotal:             $29.43
Tax:                   $2.36
TOTAL:                $31.79

Tip: ________
```

### Retail Receipt
```
TARGET
Store #1234
789 Pine Road

Phone Charger          $19.99
Notebook               $3.49
Pens (Pack)            $4.99

Subtotal:             $28.47
Sales Tax:             $2.28
TOTAL:                $30.75

Card Ending: ****1234
```