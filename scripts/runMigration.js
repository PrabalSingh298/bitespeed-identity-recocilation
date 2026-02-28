const fs = require("fs");
const pool = require("../src/config/db");

async function runMigration() {
    try {
        const sql = fs.readFileSync(
            "./src/database/migrations/001_create_contacts_table.sql",
            "utf8"
        );

        await pool.query(sql);
        console.log("Migration executed successfully 🚀");
        process.exit();
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigration();