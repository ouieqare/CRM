const jwt = require('jsonwebtoken');
const config = require('./keys');
const User = require('../models/user');

const reqAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Received authorization header:', authHeader);


  // Vérifier que l'en-tête existe
  if (!authHeader) {
    return res.status(401).json({ success: false, msg: 'No authorization token provided' });
  }

  // Extraire le token
  const tokenParts = authHeader.split(' ');
if (tokenParts.length !== 2 || (tokenParts[0] !== 'Bearer' && tokenParts[0] !== 'JWT')) {
    return res.status(401).json({ success: false, msg: 'Token format is invalid' });
}


const token = tokenParts[1];
    console.log('Token being verified:', token);
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(401).json({ success: false, msg: 'Token is invalid' });
        }
        req.user = decoded; // Assurez-vous que vous définissez req.user ici
        next();
    });

};


module.exports = {
   reqAuth: reqAuth
};
