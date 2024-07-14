// routes/clients.js
const express = require('express');
const router = express.Router();
const Client = require('../models/client'); // Assurez-vous que le chemin est correct
const { reqAuth } = require('../config/safeRoutes');  // Ajustez le chemin selon la structure de votre projet


// // GET route to fetch all clients
// router.get('/', (req, res) => {
//     Client.find({})
//       .then(clients => res.json(clients))
//       .catch(err => res.status(400).json('Error: ' + err));
//   });


// router.post('/add', (req, res) => {
//     const newClient = new Client(req.body);
  
//     newClient.save()
//       .then(client => res.status(201).json(client))
//       .catch(err => {  // Assurez-vous que 'err' est le nom du paramètre ici
//         console.error(err); // Utilisez 'err' pour log l'erreur
//         res.status(400).json({ error: err.message }); // Utilisez 'err' pour envoyer la réponse
//       });
//   });



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



// router.get('/', reqAuth, async (req, res) => {
//   const user = req.user;
//   try {
//     const clients = await Client.find({ userId: user._id });
//     res.json(clients);
//   } catch (err) {
//     console.error('Error: ' + err);
//     res.status(400).json('Error: ' + err);
//   }
// });
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



module.exports = router;
