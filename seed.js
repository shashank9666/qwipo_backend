const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const dbPath = path.join(__dirname, 'database.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database for seeding.');
});

// Sample customers data with email
const customers = [
  {
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '9876543210',
    email: 'john.doe@email.com'
  },
  {
    first_name: 'Alice',
    last_name: 'Johnson',
    phone_number: '8765432109',
    email: 'alice.johnson@email.com'
  },
  {
    first_name: 'Bob',
    last_name: 'Smith',
    phone_number: '7654321098',
    email: 'bob.smith@email.com'
  },
  {
    first_name: 'Emma',
    last_name: 'Wilson',
    phone_number: '6543210987',
    email: 'emma.wilson@email.com'
  },
  {
    first_name: 'Michael',
    last_name: 'Brown',
    phone_number: '5432109876',
    email: 'michael.brown@email.com'
  },
  {
    first_name: 'Sarah',
    last_name: 'Davis',
    phone_number: '4321098765',
    email: 'sarah.davis@email.com'
  },
  {
    first_name: 'David',
    last_name: 'Miller',
    phone_number: '3210987654',
    email: 'david.miller@email.com'
  },
  {
    first_name: 'Lisa',
    last_name: 'Garcia',
    phone_number: '2109876543',
    email: 'lisa.garcia@email.com'
  },
  {
    first_name: 'James',
    last_name: 'Rodriguez',
    phone_number: '1098765432',
    email: 'james.rodriguez@email.com'
  },
  {
    first_name: 'Anna',
    last_name: 'Martinez',
    phone_number: '0987654321',
    email: 'anna.martinez@email.com'
  }
];

// Sample addresses data with new schema
const addresses = [
  // John Doe's addresses
  {
    customer_name: 'John',
    street: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'MH',
    zip_code: '400001',
    address_type: 'home',
    is_primary: true
  },
  {
    customer_name: 'John',
    street: '456 Business Center, Office 201',
    city: 'Mumbai',
    state: 'MH',
    zip_code: '400070',
    address_type: 'work',
    is_primary: false
  },
  // Alice Johnson's addresses
  {
    customer_name: 'Alice',
    street: '789 Oak Avenue, House 12',
    city: 'Delhi',
    state: 'DL',
    zip_code: '110001',
    address_type: 'home',
    is_primary: true
  },
  {
    customer_name: 'Alice',
    street: '321 Corporate Plaza, Floor 5',
    city: 'Gurgaon',
    state: 'HR',
    zip_code: '122001',
    address_type: 'work',
    is_primary: false
  },
  // Bob Smith's addresses
  {
    customer_name: 'Bob',
    street: '555 Pine Road, Villa 8',
    city: 'Bangalore',
    state: 'KA',
    zip_code: '560001',
    address_type: 'home',
    is_primary: true
  },
  // Emma Wilson's addresses
  {
    customer_name: 'Emma',
    street: '777 Elm Street, Flat 3C',
    city: 'Chennai',
    state: 'TN',
    zip_code: '600001',
    address_type: 'home',
    is_primary: true
  },
  {
    customer_name: 'Emma',
    street: '888 IT Park, Building A, Unit 15',
    city: 'Chennai',
    state: 'TN',
    zip_code: '600113',
    address_type: 'work',
    is_primary: false
  },
  // Michael Brown's addresses
  {
    customer_name: 'Michael',
    street: '999 Sector 15, Block B, House 25',
    city: 'Noida',
    state: 'UP',
    zip_code: '201301',
    address_type: 'home',
    is_primary: true
  },
  // Sarah Davis's addresses
  {
    customer_name: 'Sarah',
    street: '111 MG Road, Apartment 7A',
    city: 'Pune',
    state: 'MH',
    zip_code: '411001',
    address_type: 'home',
    is_primary: true
  },
  {
    customer_name: 'Sarah',
    street: '222 Hadapsar Industrial Area, Warehouse 10',
    city: 'Pune',
    state: 'MH',
    zip_code: '411028',
    address_type: 'work',
    is_primary: false
  },
  // David Miller's addresses
  {
    customer_name: 'David',
    street: '333 Lake View, Tower 2, Flat 12B',
    city: 'Hyderabad',
    state: 'TG',
    zip_code: '500001',
    address_type: 'home',
    is_primary: true
  },
  // Lisa Garcia's addresses
  {
    customer_name: 'Lisa',
    street: '444 Brigade Road, Shop 5',
    city: 'Bangalore',
    state: 'KA',
    zip_code: '560025',
    address_type: 'work',
    is_primary: false
  },
  // James Rodriguez's addresses
  {
    customer_name: 'James',
    street: '666 Connaught Place, Office 301',
    city: 'Delhi',
    state: 'DL',
    zip_code: '110001',
    address_type: 'work',
    is_primary: false
  },
  {
    customer_name: 'James',
    street: '777 Karol Bagh, Apartment 6D',
    city: 'Delhi',
    state: 'DL',
    zip_code: '110005',
    address_type: 'home',
    is_primary: true
  },
  // Anna Martinez's addresses
  {
    customer_name: 'Anna',
    street: '888 Marine Drive, Sea View Apartment 9A',
    city: 'Mumbai',
    state: 'MH',
    zip_code: '400002',
    address_type: 'home',
    is_primary: true
  }
];

// Function to clear existing data
const clearData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM addresses', (err) => {
        if (err) {
          console.error('Error clearing addresses:', err);
          return reject(err);
        }
        console.log('Cleared existing addresses');
      });

      db.run('DELETE FROM customers', (err) => {
        if (err) {
          console.error('Error clearing customers:', err);
          return reject(err);
        }
        console.log('Cleared existing customers');
        resolve();
      });
    });
  });
};

// Function to insert customers
const insertCustomers = () => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO customers (first_name, last_name, phone_number, email) VALUES (?, ?, ?, ?)');
    let completed = 0;
    const total = customers.length;

    customers.forEach((customer) => {
      stmt.run([customer.first_name, customer.last_name, customer.phone_number, customer.email], function(err) {
        if (err) {
          console.error('Error inserting customer:', err);
          return reject(err);
        }

        completed++;
        if (completed === total) {
          stmt.finalize();
          console.log(`Inserted ${total} customers`);
          resolve();
        }
      });
    });
  });
};

// Function to get customer IDs for address linking
const getCustomerIds = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, first_name FROM customers', (err, rows) => {
      if (err) {
        console.error('Error fetching customer IDs:', err);
        return reject(err);
      }

      const customerMap = {};
      rows.forEach(row => {
        customerMap[row.first_name] = row.id;
      });
      console.log('Retrieved customer IDs for address linking');
      resolve(customerMap);
    });
  });
};

// Function to insert addresses
const insertAddresses = (customerMap) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO addresses (customer_id, street, city, state, zip_code, address_type, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?)');
    let completed = 0;
    let inserted = 0;
    const total = addresses.length;

    addresses.forEach((address) => {
      const customerId = customerMap[address.customer_name];
      if (!customerId) {
        console.warn(`Customer ${address.customer_name} not found, skipping address`);
        completed++;
        if (completed === total) {
          stmt.finalize();
          console.log(`Inserted ${inserted} addresses`);
          resolve();
        }
        return;
      }

      stmt.run([customerId, address.street, address.city, address.state, address.zip_code, address.address_type, address.is_primary ? 1 : 0], function(err) {
        if (err) {
          console.error('Error inserting address:', err);
          return reject(err);
        }

        inserted++;
        completed++;
        if (completed === total) {
          stmt.finalize();
          console.log(`Inserted ${inserted} addresses`);
          resolve();
        }
      });
    });
  });
};

// Function to display summary
const displaySummary = () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.phone_number,
        c.email,
        COUNT(a.id) as address_count
      FROM customers c
      LEFT JOIN addresses a ON c.id = a.customer_id
      GROUP BY c.id
      ORDER BY c.first_name
    `, (err, rows) => {
      if (err) {
        console.error('Error fetching summary:', err);
        return reject(err);
      }

      console.log('\n=== SEED DATA SUMMARY ===');
      console.log(`Total Customers: ${rows.length}`);
      let totalAddresses = 0;
      rows.forEach(row => {
        totalAddresses += row.address_count;
        console.log(`${row.first_name} ${row.last_name} (${row.phone_number}) - ${row.address_count} address(es)`);
      });
      console.log(`Total Addresses: ${totalAddresses}`);
      console.log('=========================\n');
      resolve();
    });
  });
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Step 1: Clear existing data
    await clearData();

    // Step 2: Insert customers
    await insertCustomers();

    // Step 3: Get customer IDs
    const customerMap = await getCustomerIds();

    // Step 4: Insert addresses
    await insertAddresses(customerMap);

    // Step 5: Display summary
    await displaySummary();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
      console.log('Database connection closed.');
      process.exit(0);
    });
  }
};

// Create tables if they don't exist (just in case)
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

  console.log('Database tables ensured.');

  // Start seeding after tables are created
  seedDatabase();
});
