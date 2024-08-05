// models/Client.js
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: false },
  mutuelle: { type: String, required: false },
  numeroSecu: { type: String, required: false },
  email: { type: String, required: false },
  telephoneFixe: { type: String, required: false},
  telephonePortable: { type: String, required: false },
  adresse: { type: String, required: false },
  codePostal: { type: String, required: false },
  ville: { type: String, required: false },
  note: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false }, // Nouveau champ pour la suppression logique
  statut: { type: String, required: false },
  origine: { type: String, required: false },
  dateRDV: { type: Date, required: false },
  heureRDV: { type: String, required: false },
  audiogramme: { type: String, required: false },
  bilanAuditif: {
    audiogramme: { type: String, required: false },
    typePerteAuditive: { type: String, required: false },
    niveauPerte: { type: String, required: false },
    observations: { type: String, required: false },
    recommandations: { type: String, required: false }
  },
  appareillage: {
    marqueAppareil: { type: String, required: false },
    montantAppareil: { type: String, required: false },
    monoAppareil: { type: Boolean, required: false },
    observations: { type: String, required: false }
},
marqueAppareil: { type: String, required: false },
    montantAppareil: { type: String, required: false },
    monoAppareil: { type: Boolean, required: false },
    Appobservations: { type: String, required: false }
});

ClientSchema.index(
  { email: 1, telephoneFixe: 1, telephonePortable: 1 },
  { unique: true, sparse: true }
);

const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
