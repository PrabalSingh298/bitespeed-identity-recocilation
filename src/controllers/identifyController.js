const identityService = require("../services/identityService");

async function identify(req, res) {
    try {
        const { email, phoneNumber } = req.body;

        const result = await identityService.identifyContact(email, phoneNumber);

        res.status(200).json({ contact: result });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = { identify };