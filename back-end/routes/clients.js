// routes/clients.js
const express = require('express');
const router = express.Router();
const Client = require('../models/client'); // Assurez-vous que le chemin est correct
const { reqAuth } = require('../config/safeRoutes');  // Ajustez le chemin selon la structure de votre projet
//const csvtojson = require('csvtojson');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const csvtojson = require('csvtojson');
const XLSX = require('xlsx');

router.get('/', (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization);
  return next();
}, reqAuth, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id, isDeleted: false });
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupération des clients supprimés uniquement
router.get('/deleted', reqAuth, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id, isDeleted: true });
    res.json(clients);
  } catch (err) {
    console.error('Error fetching deleted clients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/deletedef/:id', reqAuth, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Client deleted successfully' });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.delete('/:id', reqAuth, async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.status(200).json({ success: true, message: 'Client marked as deleted successfully', client: updatedClient });
  } catch (err) {
    console.error("Error marking client as deleted:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.put('/restore/:id', reqAuth, async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.status(200).json({ success: true, message: 'Client restored successfully', client: updatedClient });
  } catch (err) {
    console.error("Error restoring client:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});





router.put('/:id', reqAuth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    Object.keys(req.body).forEach(key => {
      client[key] = req.body[key];
    });

    await client.save();
    res.json({ success: true, message: 'Client updated successfully', client });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// router.post('/import', reqAuth, (req, res) => {
//   const csvData = req.body.data;
//   csvtojson()
//     .fromString(csvData)
//     .then(jsonObj => {
//       Client.insertMany(jsonObj.map(item => ({
//         ...item,
//         userId: req.user.id
//       })))
//       .then(result => res.status(201).json({ success: true, count: result.length }))
//       .catch(err => {
//         console.error("Error inserting clients:", err);
//         res.status(500).json({ success: false, error: err.message });
//       });
//     })
//     .catch(err => {
//       console.error("Error parsing CSV:", err);
//       res.status(400).json({ success: false, error: 'Invalid CSV data' });
//     });
// });

router.post('/import', reqAuth, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.file;
    let jsonData = [];

    if (file.mimetype === 'text/csv') {
        jsonData = await csvtojson().fromString(file.buffer.toString('utf8'));
    } else if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
    } else {
        return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }

    try {
        const results = await Client.insertMany(jsonData.map(item => ({
            ...item,
            userId: req.user.id
        })));
        res.status(201).json({ success: true, count: results.length });
    } catch (err) {
        console.error("Error importing data:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});


router.post('/add', reqAuth, async (req, res) => {
  console.log('Requête reçue avec les données:', req.body);

  if (!req.user || !req.user.id) {
    console.log('ID utilisateur manquant');
    return res.status(400).json({ success: false, message: 'User ID missing from token' });
  }

  const { email, telephoneFixe, telephonePortable } = req.body;
  let query = { userId: req.user.id };

  // Ajouter seulement les champs non vides à la requête
  if (email) query['email'] = email;
  if (telephoneFixe) query['telephoneFixe'] = telephoneFixe;
  if (telephonePortable) query['telephonePortable'] = telephonePortable;

  try {
    const existingClient = await Client.findOne({ $or: [query].filter(q => Object.keys(q).length > 1) });

    if (existingClient) {
      console.log('Client existant trouvé:', existingClient);
      return res.status(409).json({ success: false, message: 'Impossible d\'enregistrer, il existe déjà un client avec le même tel ou le même mail.' });
    }

    const newClient = new Client({
      ...req.body,
      userId: req.user.id
    });

    await newClient.save();
    console.log('Nouveau client enregistré:', newClient);
    res.status(201).json(newClient);
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du client:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', reqAuth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    // Mise à jour du statut spécifique, assurez-vous que le corps de la requête contient le champ `statut`
    client.statut = req.body.statut;
    
    await client.save();
    res.json({ success: true, message: 'Statut updated successfully', client });
  } catch (err) {
    console.error("Error updating client's status:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Filtrer les clients par statut
router.get('/by-status/:statut', reqAuth, async (req, res) => {
  try {
    const statut = req.params.statut; // Récupère le statut de l'URL
    const clients = await Client.find({ userId: req.user.id, statut: statut, isDeleted: false });
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients by status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;