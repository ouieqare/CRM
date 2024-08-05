const express = require('express');
const router = express.Router();
const Client = require('../models/client'); // Assurez-vous que le chemin est correct
const { reqAuth } = require('../config/safeRoutes');  // Ajustez le chemin selon la structure de votre projet

// Route pour obtenir le nombre total de clients
router.get('/total', reqAuth, async (req, res) => {
    console.log(`Fetching total clients for user: ${req.user.id}`);
    try {
        const count = await Client.countDocuments({ userId: req.user.id, isDeleted: false });
        console.log(`Total clients: ${count}`);
        res.json({ totalClients: count });
    } catch (err) {
        console.error('Error fetching total clients:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route pour obtenir le nombre de clients appareillés
router.get('/appareilles', reqAuth, async (req, res) => {
    console.log(`Fetching appareilled clients for user: ${req.user.id}`);
    try {
        const count = await Client.countDocuments({ userId: req.user.id, statut: 'Appareillé', isDeleted: false });
        console.log(`Total appareilled clients: ${count}`);
        res.json({ totalAppareilles: count });
    } catch (err) {
        console.error('Error fetching appareilled clients:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route pour obtenir le nombre de clients facturés
router.get('/factures', reqAuth, async (req, res) => {
    console.log(`Fetching billed clients for user: ${req.user.id}`);
    try {
        const count = await Client.countDocuments({ userId: req.user.id, statut: 'Facturé', isDeleted: false });
        console.log(`Total billed clients: ${count}`);
        res.json({ totalFactures: count });
    } catch (err) {
        console.error('Error fetching billed clients:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
