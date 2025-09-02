const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    process.exit(1);
  }
  console.log("Connected to the SQLite database for migration.");
});

const migrate = async () => {
  try {
    console.log("🔄 Starting database migration...\n");

    // Step 1: Check if customers table exists, create if not
    await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='customers'",
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            // Create customers table with email column
            db.run(
              `CREATE TABLE customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone_number TEXT NOT NULL UNIQUE,
            email TEXT
          )`,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  console.log("✅ Created customers table with email column");
                  resolve();
                }
              }
            );
          } else {
            console.log("ℹ️  Customers table exists");
            resolve();
          }
        }
      );
    });

    // Step 2: Add email column if customers table exists but doesn't have email
    await new Promise((resolve, reject) => {
      db.get("PRAGMA table_info(customers)", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        // Check all columns
        db.all("PRAGMA table_info(customers)", (err, columns) => {
          if (err) {
            reject(err);
            return;
          }

          const hasEmail = columns.some((col) => col.name === "email");

          if (!hasEmail) {
            db.run("ALTER TABLE customers ADD COLUMN email TEXT", (err) => {
              if (err) {
                reject(err);
              } else {
                console.log("✅ Added email column to customers table");
                resolve();
              }
            });
          } else {
            console.log("ℹ️  Email column already exists in customers table");
            resolve();
          }
        });
      });
    });

    // Step 3: Handle addresses table migration
    await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='addresses'",
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            // Create new addresses table directly
            db.run(
              `CREATE TABLE addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip_code TEXT NOT NULL,
            address_type TEXT DEFAULT 'home',
            is_primary INTEGER DEFAULT 0,
            FOREIGN KEY (customer_id) REFERENCES customers (id)
          )`,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(
                    "✅ Created new addresses table with updated schema"
                  );
                  resolve();
                }
              }
            );
          } else {
            // Check if old schema (has address_details and pin_code)
            db.all("PRAGMA table_info(addresses)", (err, columns) => {
              if (err) {
                reject(err);
                return;
              }

              const hasOldSchema =
                columns.some((col) => col.name === "address_details") ||
                columns.some((col) => col.name === "pin_code");
              const hasNewSchema =
                columns.some((col) => col.name === "street") &&
                columns.some((col) => col.name === "zip_code");

              if (hasOldSchema && !hasNewSchema) {
                console.log("ℹ️  Found old addresses schema, migrating...");

                // Create new table
                db.run(
                  `CREATE TABLE addresses_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                street TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                zip_code TEXT NOT NULL,
                address_type TEXT DEFAULT 'home',
                is_primary INTEGER DEFAULT 0,
                FOREIGN KEY (customer_id) REFERENCES customers (id)
              )`,
                  (err) => {
                    if (err) {
                      reject(err);
                      return;
                    }

                    // Migrate data
                    db.run(
                      `INSERT INTO addresses_new (customer_id, street, city, state, zip_code, address_type, is_primary)
                        SELECT customer_id, address_details, city, state, pin_code, 'home', 0 
                        FROM addresses`,
                      (err) => {
                        if (err) {
                          console.log(
                            "ℹ️  No data to migrate or migration error (continuing...)"
                          );
                        } else {
                          console.log("✅ Migrated existing address data");
                        }

                        // Drop old table and rename new one
                        db.run("DROP TABLE addresses", (err) => {
                          if (err) {
                            reject(err);
                            return;
                          }

                          db.run(
                            "ALTER TABLE addresses_new RENAME TO addresses",
                            (err) => {
                              if (err) {
                                reject(err);
                              } else {
                                console.log(
                                  "✅ Completed addresses table migration"
                                );
                                resolve();
                              }
                            }
                          );
                        });
                      }
                    );
                  }
                );
              } else if (hasNewSchema) {
                console.log("ℹ️  Addresses table already has new schema");
                resolve();
              } else {
                console.log(
                  "⚠️  Addresses table has unknown schema, recreating..."
                );

                // Drop and recreate
                db.run("DROP TABLE addresses", (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  db.run(
                    `CREATE TABLE addresses (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  customer_id INTEGER,
                  street TEXT NOT NULL,
                  city TEXT NOT NULL,
                  state TEXT NOT NULL,
                  zip_code TEXT NOT NULL,
                  address_type TEXT DEFAULT 'home',
                  is_primary INTEGER DEFAULT 0,
                  FOREIGN KEY (customer_id) REFERENCES customers (id)
                )`,
                    (err) => {
                      if (err) {
                        reject(err);
                      } else {
                        console.log(
                          "✅ Recreated addresses table with new schema"
                        );
                        resolve();
                      }
                    }
                  );
                });
              }
            });
          }
        }
      );
    });

    console.log("\n🎉 Database migration completed successfully!");
    console.log("You can now run: node seed.js");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
      process.exit(0);
    });
  }
};

migrate();
