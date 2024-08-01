const mongoose = require('mongoose');

const FactureSchema = new mongoose.Schema({
  objet: { type: String, required: true },
  heureCreation: { type: String, required: true }, // Supposition que l'heure est stockée en format String
  dateFacture: { type: Date, required: true },
  nomClient: { type: String, required: true },
  totalGeneral: { type: Number, required: true },
  statut: { type: String, required: true }, // Assurez-vous que ce champ est configuré comme nécessaire
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false }
});

// Index pour potentiellement améliorer les performances des requêtes
FactureSchema.index({ dateFacture: 1 });

const Facture = mongoose.model('Facture', FactureSchema);
module.exports = Facture;
