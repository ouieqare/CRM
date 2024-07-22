dbPasswordDev ='mongodb://localhost/Ouieqare';

// for PRODUCTION
// const MONGO_USERNAME = 'esthere';
// const MONGO_PASSWORD = 'Nb3UhA8heygqwENV';
// const MONGO_HOSTNAME = 'cluster0.ygczhra.mongodb.net';
// // const MONGO_PORT = '27017';
// const MONGO_DB = 'ouieqare';

// const dbPasswordProd = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}/${MONGO_DB}?retryWrites=true&w=majority`;
// // const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
// const mongoURI = process.env.NODE_ENV === 'production' ? dbPasswordProd : dbPasswordDev;

module.exports = {
  mongoURI: dbPasswordDev,
  secret: 'yourSecretKey',
};

// module.exports = {
//   secret: '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',
//   googleClientID: '372588693859-odccs5brht2mlo6e2857lbhrlipql13m.apps.googleusercontent.com',
//   googleClientSecret: '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'
// };
