// models/Client.js
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: false },
  mutuelle: { type: String, required: false },
  numeroSecu: { type: String, required: false },
  email: { type: String, required: false },
  telephoneFixe: { type: String, required: false },
  telephonePortable: { type: String, required: false },
  adresse: { type: String, required: false },
  codePostal: { type: String, required: false },
  ville: { type: String, required: false },
  statut: { type: String, required: false },
  dateRDV: { type: Date, required: false },
  heureRDV: { type: String, required: false },
  bilanAuditif: { type: String, required: false },
  note: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Ajout de la référence à User
});

const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
