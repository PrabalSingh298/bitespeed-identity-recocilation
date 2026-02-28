const pool = require("../config/db");

async function findMatchingContacts(email, phoneNumber) {
    const [rows] = await pool.query(
        `SELECT * FROM contacts 
     WHERE email = ? OR phoneNumber = ?`,
        [email || null, phoneNumber || null]
    );
    return rows;
}

async function createContact(email, phoneNumber, linkPrecedence = "primary", linkedId = null) {
    const [result] = await pool.query(
        `INSERT INTO contacts (email, phoneNumber, linkPrecedence, linkedId)
     VALUES (?, ?, ?, ?)`,
        [email || null, phoneNumber || null, linkPrecedence, linkedId]
    );
    return result.insertId;
}

async function findAllLinkedContacts(primaryId) {
    const [rows] = await pool.query(
        `SELECT * FROM contacts 
     WHERE id = ? OR linkedId = ?`,
        [primaryId, primaryId]
    );
    return rows;
}

async function updateToSecondary(id, primaryId) {
    await pool.query(
        `UPDATE contacts 
     SET linkPrecedence = 'secondary', linkedId = ?
     WHERE id = ?`,
        [primaryId, id]
    );
}

module.exports = {
    findMatchingContacts,
    createContact,
    findAllLinkedContacts,
    updateToSecondary
};