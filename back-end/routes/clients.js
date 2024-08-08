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
const PDFDocument = require('pdfkit');
const fs = require('fs');

router.get('/', (req, res, next) => {
  console.log('API /api/clients called');
  console.log("Authorization Header:", req.headers.authorization);
  return next();
}, reqAuth, async (req, res) => {
  try {
    console.log('Fetching clients for user:', req.user.id);
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

    jsonData = jsonData.map(client => ({
      ...client,
      userId: req.user.id
    }));

    // Insérer les données tout en gérant les doublons
    const results = await Client.insertMany(jsonData, { ordered: false });
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

// Route pour obtenir le nombre de clients par statut pour un utilisateur spécifique
router.get('/count-by-status', reqAuth, async (req, res) => {
  try {
    const statusCounts = await Client.aggregate([
      { $match: { userId: req.user.id, isDeleted: false } }, // Assurez-vous de filtrer les clients de l'utilisateur connecté et non supprimés
      { $group: { _id: "$statut", count: { $sum: 1 } } }
    ]);

    // Transformer le résultat en un objet clé-valeur pour faciliter l'accès aux données
    const counts = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json(counts);
  } catch (error) {
    console.error('Failed to count clients by status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// router.get('/counts', reqAuth, async (req, res) => {
//   try {
//     const totalClients = await Client.countDocuments({ userId: req.user.id });
//     const totalAppareilles = await Client.countDocuments({ userId: req.user.id, statut: 'Appareillé' });
//     const totalFactures = await Client.countDocuments({ userId: req.user.id, statut: 'Facturé' });

//     res.json({ totalClients, totalAppareilles, totalFactures });
//   } catch (err) {
//     console.error('Error fetching counts:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Assurez-vous que le middleware 'reqAuth' valide correctement le token
router.get('/counts', reqAuth, async (req, res) => {
  try {
    // const totalClients = await Client.countDocuments({ userId: req.user.id });
    const totalAppareilles = await Client.countDocuments({ userId: req.user.id, statut: 'Appareillé' });
    const totalFactures = await Client.countDocuments({ userId: req.user.id, statut: 'Facturé' });

    res.json({ totalClients, totalAppareilles, totalFactures });
  } catch (err) {
    console.error('Error fetching counts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/generate-pdf', (req, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);
  
  // Configurer le document pour qu'il ressemble à votre modèle officiel
  doc.font('Helvetica'); // Choisissez une police appropriée
  doc.fontSize(12); // Définissez la taille de la police
  
  // Ajouter un titre
  doc.text('Titre du Document Officiel', {
    align: 'center'
  });
  
  // Ajouter du texte avec un placement précis
  doc.text('Voici un exemple de texte positionné précisément.', 100, 100);
  
  // Dessiner une ligne ou un autre élément graphique
  doc.moveTo(50, 150)
    .lineTo(250, 150)
    .stroke();
  
  // Vous pouvez continuer à ajouter d'autres éléments ici
  
  doc.end(); // Finalisez le document
});



module.exports = router;