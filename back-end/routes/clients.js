// routes/clients.js
const express = require('express');
const router = express.Router();
const Client = require('../models/client'); // Assurez-vous que le chemin est correct

// GET route to fetch all clients
router.get('/', (req, res) => {
    Client.find({})
      .then(clients => res.json(clients))
      .catch(err => res.status(400).json('Error: ' + err));
  });
  

router.post('/add', (req, res) => {
    const newClient = new Client(req.body);
  
    newClient.save()
      .then(client => res.status(201).json(client))
      .catch(err => {  // Assurez-vous que 'err' est le nom du paramètre ici
        console.error(err); // Utilisez 'err' pour log l'erreur
        res.status(400).json({ error: err.message }); // Utilisez 'err' pour envoyer la réponse
      });
  });
  

module.exports = router;
