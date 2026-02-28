const contactModel = require("../models/contactModel");

async function identifyContact(email, phoneNumber) {

    if (!email && !phoneNumber) {
        throw new Error("Either email or phoneNumber must be provided");
    }

    const matches = await contactModel.findMatchingContacts(email, phoneNumber);

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

    // Find primary contact (oldest primary)
    let primary = matches
        .filter(c => c.linkPrecedence === "primary")
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

    if (!primary) {
        primary = matches[0];
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
            primary.id
        );
    }

    const allLinked = await contactModel.findAllLinkedContacts(primary.id);

    const emails = [...new Set(allLinked.map(c => c.email).filter(Boolean))];
    const phoneNumbers = [...new Set(allLinked.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryIds = allLinked
        .filter(c => c.linkPrecedence === "secondary")
        .map(c => c.id);

    return {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds
    };
}

module.exports = { identifyContact };