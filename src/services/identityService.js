const contactModel = require("../models/contactModel");
const pool = require("../config/db")

async function identifyContact(email1, phoneNumber1) {

    const email = email1?.trim() || null;
    const phoneNumber = phoneNumber1?.trim() || null;

    if (!email && !phoneNumber) {
        throw new Error("Either email or phoneNumber must be provided");
    }

    const matches = await contactModel.findMatchingContacts(email, phoneNumber);

    // console.log("Matches:", matches);

    // CASE 1: No existing contact
    if (matches.length === 0) {
        const id = await contactModel.createContact(email, phoneNumber, "primary", null);

        return {
            primaryContactId: id,
            emails: email ? [email] : [],
            phoneNumbers: phoneNumber ? [phoneNumber] : [],
            secondaryContactIds: []
        };
    }


    // Step: Get all related contacts
    const contactIds = matches.map(c =>
        c.linkPrecedence === "primary" ? c.id : c.linkedId
    );

    const uniquePrimaryIds = [...new Set(contactIds)];



    const [allContacts] = await pool.query(
        `SELECT * FROM contacts WHERE id IN (?) OR linkedId IN (?)`,
        [uniquePrimaryIds, uniquePrimaryIds]
    );

    // Find all primaries
    const primaries = allContacts.filter(
        c => c.linkPrecedence === "primary"
    );

    // If more than one primary → merge
    if (primaries.length > 1) {

        primaries.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        const oldestPrimary = primaries[0];

        for (let i = 1; i < primaries.length; i++) {
            const toMerge = primaries[i];

            // Convert primary → secondary
            await pool.query(
                `UPDATE contacts
         SET linkPrecedence = 'secondary',
             linkedId = ?
         WHERE id = ?`,
                [oldestPrimary.id, toMerge.id]
            );

            // Update all contacts linked to this primary
            await pool.query(
                `UPDATE contacts
         SET linkedId = ?
         WHERE linkedId = ?`,
                [oldestPrimary.id, toMerge.id]
            );
        }
    }

    // console.log(
    //     "Primary candidates:",
    //     matches.filter(c => c.linkPrecedence === "primary")
    // );



    // Find primary contact (oldest primary)
    // let primary = matches
    //     .filter(c => c.linkPrecedence === "primary")
    //     .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

    // if (!primary) {
    //     primary = matches[0];
    // }


    let primaryContact;

    const primaryFromMatches = matches.find(
        c => c.linkPrecedence === "primary"
    );

    if (primaryFromMatches) {
        primaryContact = primaryFromMatches;
    } else {
        // If only secondary found, fetch its primary
        const secondary = matches[0];

        const [primaryRows] = await pool.query(
            "SELECT * FROM contacts WHERE id = ?",
            [secondary.linkedId]
        );

        primaryContact = primaryRows[0];
    }



    // const emailExists = matches.some(c => c.email === email);
    // const phoneExists = matches.some(c => c.phoneNumber === phoneNumber);

    // if (!emailExists || !phoneExists) {
    //     await createContact(...)
    // }



    // If new info not already stored → create secondary
    // const emailExists = matches.some(c => c.email === email);
    // const phoneExists = matches.some(c => c.phoneNumber === phoneNumber);

    // if (!emailExists || !phoneExists) {
    //     await contactModel.createContact(
    //         email,
    //         phoneNumber,
    //         "secondary",
    //         primary.id
    //     );
    // }


    const emailExists = email
        ? matches.some(c => c.email === email)
        : true;

    const phoneExists = phoneNumber
        ? matches.some(c => c.phoneNumber === phoneNumber)
        : true;

    if (!emailExists || !phoneExists) {
        await contactModel.createContact(
            email || null,
            phoneNumber || null,
            "secondary",
            primaryContact.id
        );
    }

    const allLinked = await contactModel.findAllLinkedContacts(primaryContact.id);

    const emails = [...new Set(allLinked.map(c => c.email).filter(Boolean))];
    const phoneNumbers = [...new Set(allLinked.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryIds = allLinked
        .filter(c => c.linkPrecedence === "secondary")
        .map(c => c.id);

    return {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds
    };
}

module.exports = { identifyContact };