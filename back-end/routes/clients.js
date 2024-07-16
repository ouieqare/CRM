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


router.post('/add', reqAuth, async (req, res) => {
  if (!req.user || !req.user.id) {
      return res.status(400).json({ success: false, message: 'User ID missing from token' });
  }

  const newClient = new Client({
      ...req.body,
      userId: req.user.id  // Assurez-vous que l'ID de l'utilisateur est correctement attaché
  });

  try {
      await newClient.save();
      res.status(201).json(newClient);
  } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
  }
});

router.get('/', (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization);
  return next();
}, reqAuth, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id });
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', reqAuth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.status(200).json({ success: true, message: 'Client deleted successfully', client: client });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mise à jour d'un client existant
// router.put('/:id', reqAuth, async (req, res) => {
//   try {
//       const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
//       if (!client) {
//           return res.status(404).json({ success: false, message: 'Client not found' });
//       }
//       res.json({ success: true, message: 'Client updated successfully', client });
//   } catch (err) {
//       console.error("Error updating client:", err);
//       res.status(500).json({ success: false, error: err.message });
//   }
// });

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



module.exports = router;
