const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Add this line to load environment variables

const app = express();

// Use CORS with environment variable
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create tables
db.serialize(() => {
  // Create customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    email TEXT
  )`);

  // Create addresses table
  db.run(`CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    address_type TEXT DEFAULT 'home',
    is_primary INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
  )`);
});

// Customer Routes

// GET all customers with search, pagination
app.get('/api/customers', (req, res) => {
  const { search, city, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM customers WHERE 1=1`;
  let params = [];

  if (search) {
    sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR email LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  if (city) {
    sql += ` AND id IN (SELECT DISTINCT customer_id FROM addresses WHERE city LIKE ?)`;
    params.push(`%${city}%`);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM customers WHERE 1=1`;
    let countParams = [];

    if (search) {
      countSql += ` AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR email LIKE ?)`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (city) {
      countSql += ` AND id IN (SELECT DISTINCT customer_id FROM addresses WHERE city LIKE ?)`;
      countParams.push(`%${city}%`);
    }

    db.get(countSql, countParams, (err, countResult) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      res.json({
        message: "success",
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// GET single customer
app.get('/api/customers/:id', (req, res) => {
  const sql = `SELECT * FROM customers WHERE id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({
      message: "success",
      data: row
    });
  });
});

// POST create customer
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, phone_number, email } = req.body;
  
  if (!first_name || !last_name || !phone_number) {
    res.status(400).json({ error: "First name, last name, and phone number are required" });
    return;
  }

  const sql = `INSERT INTO customers (first_name, last_name, phone_number, email) VALUES (?, ?, ?, ?)`;
  db.run(sql, [first_name, last_name, phone_number, email || null], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: { id: this.lastID, first_name, last_name, phone_number, email }
    });
  });
});

// PUT update customer
app.put('/api/customers/:id', (req, res) => {
  const { first_name, last_name, phone_number, email } = req.body;
  
  if (!first_name || !last_name || !phone_number) {
    res.status(400).json({ error: "First name, last name, and phone number are required" });
    return;
  }

  const sql = `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ?, email = ? WHERE id = ?`;
  db.run(sql, [first_name, last_name, phone_number, email || null, req.params.id], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({
      message: "success",
      data: { id: req.params.id, first_name, last_name, phone_number, email }
    });
  });
});

// DELETE customer
app.delete('/api/customers/:id', (req, res) => {
  // First delete all addresses for this customer
  db.run(`DELETE FROM addresses WHERE customer_id = ?`, [req.params.id], (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    // Then delete the customer
    const sql = `DELETE FROM customers WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      res.json({ message: "Customer deleted successfully" });
    });
  });
});

// Address Routes

// GET addresses for a customer
app.get('/api/customers/:id/addresses', (req, res) => {
  const sql = `SELECT * FROM addresses WHERE customer_id = ?`;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows
    });
  });
});

// POST create address
app.post('/api/customers/:id/addresses', (req, res) => {
  const { street, city, state, zip_code, address_type = 'home', is_primary = false } = req.body;
  const customer_id = req.params.id;
  
  if (!street || !city || !state || !zip_code) {
    res.status(400).json({ error: "Street, city, state, and ZIP code are required" });
    return;
  }

  const sql = `INSERT INTO addresses (customer_id, street, city, state, zip_code, address_type, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [customer_id, street, city, state, zip_code, address_type, is_primary ? 1 : 0], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      success: true,
      message: "Address added successfully",
      data: { id: this.lastID, customer_id, street, city, state, zip_code, address_type, is_primary }
    });
  });
});

// PUT update address
app.put('/api/addresses/:addressId', (req, res) => {
  const { street, city, state, zip_code, address_type = 'home', is_primary = false } = req.body;
  
  if (!street || !city || !state || !zip_code) {
    res.status(400).json({ error: "Street, city, state, and ZIP code are required" });
    return;
  }

  const sql = `UPDATE addresses SET street = ?, city = ?, state = ?, zip_code = ?, address_type = ?, is_primary = ? WHERE id = ?`;
  db.run(sql, [street, city, state, zip_code, address_type, is_primary ? 1 : 0, req.params.addressId], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      data: { id: req.params.addressId, street, city, state, zip_code, address_type, is_primary }
    });
  });
});

// DELETE address
app.delete('/api/addresses/:addressId', (req, res) => {
  const sql = `DELETE FROM addresses WHERE id = ?`;
  db.run(sql, [req.params.addressId], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    res.json({ message: "Address deleted successfully" });
  });
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000; // Use environment variable for port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});