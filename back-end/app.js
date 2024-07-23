const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const compression = require('compression');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const db = require('./config/keys').mongoURI;
const CronJob = require('cron').CronJob;
const crons = require('./config/crons');
const clientsRoutes = require('./routes/clients');
require('dotenv').config();

// Instantiate express
const app = express();
app.use('/', clientsRoutes);
app.use(compression());

// Passport Config
require('./config/passport')(passport);
// Route pour démarrer l'authentification Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  app.get('/auth/login', (req, res) => {
    // Assurez-vous de servir ici le fichier HTML ou de rendre la vue de connexion.
    res.render('login'); // Utilisez `res.render` si vous utilisez un moteur de templates comme ejs, pug, etc.
  });
// Route pour gérer le callback après authentification
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Authentification réussie, rediriger vers la page d'accueil.
    res.redirect('/');
  });

// DB Config

// Connect to MongoDB
mongoose.Promise = global.Promise;  // Utilisation des promesses natives
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Failed to connect to MongoDB', err));


app.use(cors());


// Express body parser
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




// REACT BUILD for production
if (process.env.NODE_ENV === 'PROD') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Initialize routes middleware
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));

// run at 3:10 AM -> delete old tokens
const tokensCleanUp = new CronJob('10 3 * * *', function() {
  crons.tokensCleanUp();
});
tokensCleanUp.start();

const PORT = process.env.PORT || 5100;

http.createServer({}, app)
    .listen(PORT, function() {
      console.log('App listening on port ' + PORT + '! Go to http://localhost:' + PORT + '/');
    });

// FOR HTTPS ONLY
// https.createServer({
//   key: fs.readFileSync(process.env.SSLKEY),
//   cert: fs.readFileSync(process.env.SSLCERT),
// }, app)
//     .listen(PORT, function() {
//       console.log('App listening on port ' + PORT + '! Go to https://localhost:' + PORT + '/');
//     });
// app.use(requireHTTPS); //FOR HTTPS
// app.enable('trust proxy');
// app.use(function(req, res, next) {
//   if (req.secure) {
//     return next();
//   }
//   res.redirect('https://' + req.headers.host + req.url);
// });


/**
 * @param {int} req req.
 * @param {int} res res.
 * @param {int} next next.
 * @return {void} none.
 */
function requireHTTPS(req, res, next) {
  if (!req.secure) {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}
