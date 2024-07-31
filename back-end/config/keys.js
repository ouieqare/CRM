// dbPasswordDev ='mongodb://localhost/Ouieqare';

const dbPasswordProd = process.env.NODE_ENV === 'production' ? 
  `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOSTNAME}/${process.env.MONGO_DB}?retryWrites=true&w=majority` : 
  'mongodb://localhost/Ouieqare';

module.exports = {
  mongoURI: dbPasswordProd,
  secret: 'yourSecretKey',
};

