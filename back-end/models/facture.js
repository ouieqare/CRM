const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence')(mongoose);

const FactureSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  objet: { type: String, required: true },
  heureCreation: { type: String, required: true }, // Supposition que l'heure est stockée en format String
  dateFacture: { type: Date, required: true },
  nomClient: { type: String, required: true },
  totalGeneral: { type: Number, required: true },
  statut: { type: String, required: true }, // Assurez-vous que ce champ est configuré comme nécessaire
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: false },
  telephoneFixe: { type: String, required: false},
  telephonePortable: { type: String, required: false },
  adresse: { type: String, required: false },
  codePostal: { type: String, required: false },
  ville: { type: String, required: false },
  note: { type: String, required: false },
  isDeleted: { type: Boolean, default: false },
  numeroFacture: { type: Number, default: 0},
  articles: [{
    type: Object,
    required: true
  }]
});

// Index pour potentiellement améliorer les performances des requêtes
FactureSchema.index({ dateFacture: 1 });

FactureSchema.plugin(AutoIncrementFactory, {inc_field: 'numeroFacture'});
const Facture = mongoose.model('Facture', FactureSchema);
module.exports = Facture;
