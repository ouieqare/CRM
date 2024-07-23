dbPasswordDev ='mongodb://localhost/Ouieqare';

const dbPasswordProd = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}/${MONGO_DB}?retryWrites=true&w=majority`;
// // const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const mongoURI = process.env.NODE_ENV === 'production' ? dbPasswordProd : dbPasswordDev;

module.exports = {
  mongoURI: mongoURI,
  secret: 'yourSecretKey',
};
