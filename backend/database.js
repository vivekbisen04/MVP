const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'receipts.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create receipts table
      db.run(`
        CREATE TABLE IF NOT EXISTS receipts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          merchant TEXT NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          points_awarded INTEGER DEFAULT 25,
          image_path TEXT,
          processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          raw_ocr_text TEXT,
          confidence DECIMAL(5,2)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating receipts table:', err);
          reject(err);
          return;
        }
      });

      // Create points_ledger table
      db.run(`
        CREATE TABLE IF NOT EXISTS points_ledger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_type TEXT DEFAULT 'earned',
          amount INTEGER NOT NULL,
          receipt_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (receipt_id) REFERENCES receipts (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating points_ledger table:', err);
          reject(err);
          return;
        }
        console.log('Database initialized successfully');
        resolve();
      });
    });
  });
};

// Database helper functions
const dbHelpers = {
  // Insert new receipt
  insertReceipt: (receiptData) => {
    return new Promise((resolve, reject) => {
      const { merchant, total_amount, points_awarded, raw_ocr_text, confidence } = receiptData;
      
      db.run(`
        INSERT INTO receipts (merchant, total_amount, points_awarded, raw_ocr_text, confidence)
        VALUES (?, ?, ?, ?, ?)
      `, [merchant, total_amount, points_awarded, raw_ocr_text, confidence], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, ...receiptData });
      });
    });
  },

  // Insert points transaction
  insertPointsTransaction: (transactionData) => {
    return new Promise((resolve, reject) => {
      const { transaction_type, amount, receipt_id } = transactionData;
      
      db.run(`
        INSERT INTO points_ledger (transaction_type, amount, receipt_id)
        VALUES (?, ?, ?)
      `, [transaction_type, amount, receipt_id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, ...transactionData });
      });
    });
  },

  // Get all receipts
  getAllReceipts: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM receipts 
        ORDER BY processed_at DESC
      `, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  },

  // Get total points balance
  getTotalPoints: () => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT COALESCE(SUM(amount), 0) as total_points 
        FROM points_ledger
      `, [], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.total_points);
      });
    });
  },

  // Check for duplicate receipts (basic implementation)
  checkDuplicateReceipt: (merchant, total_amount) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM receipts 
        WHERE merchant = ? AND total_amount = ? 
        AND processed_at > datetime('now', '-1 hour')
      `, [merchant, total_amount], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(!!row); // Returns true if duplicate found
      });
    });
  }
};

module.exports = {
  db,
  initDatabase,
  dbHelpers
};