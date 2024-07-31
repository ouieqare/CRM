// routes/factures.js
const express = require('express');
const router = express.Router();
const Facture = require('../models/facture'); // Assurez-vous que le chemin est correct
const { reqAuth } = require('../config/safeRoutes');  // Ajustez le chemin selon la structure de votre projet
//const csvtojson = require('csvtojson');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const csvtojson = require('csvtojson');
const XLSX = require('xlsx');

router.get('/', (req, res, next) => {
  console.log('API /api/factures called');
  console.log("Authorization Header:", req.headers.authorization);
  return next();
}, reqAuth, async (req, res) => {
  try {
    console.log('Fetching factures for user:', req.user.id);
    const factures = await Facture.find({ userId: req.user.id, isDeleted: false });
    res.json(factures);
  } catch (err) {
    console.error('Error fetching factures:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupération des factures supprimés uniquement
router.get('/deleted', reqAuth, async (req, res) => {
  try {
    const factures = await Facture.find({ userId: req.user.id, isDeleted: true });
    res.json(factures);
  } catch (err) {
    console.error('Error fetching deleted factures:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/deletedef/:id', reqAuth, async (req, res) => {
  try {
    await Facture.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Facture deleted successfully' });
  } catch (err) {
    console.error("Error deleting facture:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.delete('/:id', reqAuth, async (req, res) => {
  try {
    const updatedFacture = await Facture.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!updatedFacture) {
      return res.status(404).json({ success: false, message: 'Facture not found' });
    }
    res.status(200).json({ success: true, message: 'Facture marked as deleted successfully', facture: updatedFacture });
  } catch (err) {
    console.error("Error marking facture as deleted:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.put('/restore/:id', reqAuth, async (req, res) => {
  try {
    const updatedFacture = await Facture.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!updatedFacture) {
      return res.status(404).json({ success: false, message: 'Facture not found' });
    }
    res.status(200).json({ success: true, message: 'Facture restored successfully', facture: updatedFacture });
  } catch (err) {
    console.error("Error restoring facture:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});





router.put('/:id', reqAuth, async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ success: false, message: 'Facture not found' });
    }

    Object.keys(req.body).forEach(key => {
      facture[key] = req.body[key];
    });

    await facture.save();
    res.json({ success: true, message: 'Facture updated successfully', facture });
  } catch (err) {
    console.error("Error updating facture:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// router.post('/import', reqAuth, (req, res) => {
//   const csvData = req.body.data;
//   csvtojson()
//     .fromString(csvData)
//     .then(jsonObj => {
//       Facture.insertMany(jsonObj.map(item => ({
//         ...item,
//         userId: req.user.id
//       })))
//       .then(result => res.status(201).json({ success: true, count: result.length }))
//       .catch(err => {
//         console.error("Error inserting factures:", err);
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

  try {
    // Détecter le type de fichier et parser en conséquence
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

    jsonData = jsonData.map(facture => ({
      ...facture,
      userId: req.user.id
    }));

    // Insérer les données tout en gérant les doublons
    const results = await Facture.insertMany(jsonData, { ordered: false });
    res.status(201).json({ success: true, count: results.length });
  } catch (err) {
    if (err.code === 11000) {  // Erreur de doublon
      // Capture et renvoie des informations détaillées sur les erreurs de duplicata
      const errors = err.writeErrors.map(error => ({
        index: error.index,
        field: error.err.op,
        error: error.errmsg,
      }));
      res.status(409).json({ success: false, message: 'Duplicate key error', errors: errors });
    } else {
      console.error("Error importing data:", err);
      res.status(500).json({ success: false, error: 'Internal Server Error', details: err.message });
    }
  }
});


router.post('/add', reqAuth, async (req, res) => {
  console.log('Requête reçue avec les données:', req.body);

  if (!req.user || !req.user.id) {
    console.log('ID utilisateur manquant');
    return res.status(400).json({ success: false, message: 'User ID missing from token' });
  }

  const { email, telephonePortable } = req.body;
  let query = { userId: req.user.id };

  // Ajouter seulement les champs non vides à la requête
  if (email) query['email'] = email;
  // if (telephoneFixe) query['telephoneFixe'] = telephoneFixe;
  if (telephonePortable) query['telephonePortable'] = telephonePortable;

  try {
    const existingFacture = await Facture.findOne({ $or: [query].filter(q => Object.keys(q).length > 1) });

    if (existingFacture) {
      console.log('Facture existant trouvé:', existingFacture);
      return res.status(409).json({ success: false, message: 'Impossible d\'enregistrer, il existe déjà un facture avec le même tel ou le même mail.' });
    }

    const newFacture = new Facture({
      ...req.body,
      userId: req.user.id
    });

    await newFacture.save();
    console.log('Nouveau facture enregistré:', newFacture);
    res.status(201).json(newFacture);
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du facture:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', reqAuth, async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ success: false, message: 'Facture not found' });
    }
    
    // Mise à jour du statut spécifique, assurez-vous que le corps de la requête contient le champ `statut`
    facture.statut = req.body.statut;
    
    await facture.save();
    res.json({ success: true, message: 'Statut updated successfully', facture });
  } catch (err) {
    console.error("Error updating facture's status:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Filtrer les factures par statut
router.get('/by-status/:statut', reqAuth, async (req, res) => {
  try {
    const statut = req.params.statut; // Récupère le statut de l'URL
    const factures = await Facture.find({ userId: req.user.id, statut: statut, isDeleted: false });
    res.json(factures);
  } catch (err) {
    console.error('Error fetching factures by status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour obtenir le nombre de factures par statut pour un utilisateur spécifique
router.get('/count-by-status', reqAuth, async (req, res) => {
  try {
    const statusCounts = await Facture.aggregate([
      { $match: { userId: req.user.id, isDeleted: false } }, // Assurez-vous de filtrer les factures de l'utilisateur connecté et non supprimés
      { $group: { _id: "$statut", count: { $sum: 1 } } }
    ]);

    // Transformer le résultat en un objet clé-valeur pour faciliter l'accès aux données
    const counts = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json(counts);
  } catch (error) {
    console.error('Failed to count factures by status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/counts', reqAuth, async (req, res) => {
  try {
    const totalFactures = await Facture.countDocuments({ userId: req.user.id });
    res.json({ totalFactures, totalAppareilles, totalFactures });
  } catch (err) {
    console.error('Error fetching counts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;