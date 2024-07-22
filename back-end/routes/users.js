const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const User = require('../models/user');
const ActiveSession = require('../models/activeSession');
const reqAuth = require('../config/safeRoutes').reqAuth;
const {smtpConf} = require('../config/config');
const Client = require('../models/client');
// route /admin/users/


router.post('/all', reqAuth, async (req, res) => {
  try {
    let users = await User.find({});
    users = users.map(user => {
      return {
        ...user._doc,
        password: undefined,
        __v: undefined
      };
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
});


router.post('/edit', reqAuth, async (req, res) => {
  const { userID, name, email } = req.body;
  try {
    const user = await User.findById(userID);
    if (user) {
      await User.updateOne({ _id: userID }, { $set: { name: name, email: email } });
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, msg: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});



router.post('/check/resetpass/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (user && user.resetPass) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

router.post('/resetpass/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (password.length < 6) {
    return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await User.updateOne({ _id: id }, { $set: { resetPass: false, password: hash } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});


router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, msg: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'Email Address does not exist' });
    }

    await User.updateOne({ _id: user._id }, { $set: { resetPass: true } });
    // Assuming SMTP configuration is set correctly and process.env.DEMO is handled
    const transporter = nodemailer.createTransport(smtpConf);
    await transporter.sendMail({
      from: `"Creative Tim" <${smtpConf.auth.user}>`,
      to: email,
      subject: 'Creative Tim Reset Password',
      html: `<h1>Hey,</h1><br><p>If you want to reset your password, please click on the following link:</p><p><a href="http://localhost:3000/auth/confirm-password/${user._id}">Reset Password</a></p>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// router.post('/register', (req, res) => {
//   const {name, email, password} = req.body;

//   User.findOne({email: email}).then((user) => {
//     if (user) {
//       res.json({success: false, msg: 'Email already exists'});
//     } else if (password.length < 6) {
//       // eslint-disable-next-line max-len
//       res.json({success: false, msg: 'Password must be at least 6 characters long'});
//     } else {
//       bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(password, salt, null, (err, hash) => {
//           if (err) throw err;
//           const query = {name: name, email: email,
//             password: hash};
//           User.create(query, function(err, user) {
//             if (err) throw err;

//             const transporter = nodemailer.createTransport(smtpConf);

//             // don't send emails if it is in demo mode
//             if (process.env.DEMO != 'yes') {
//             // send mail with defined transport object
//               transporter.sendMail({
//                 from: '"Creative Tim" <' + smtpConf.auth.user + '>',
//                 to: email, // list of receivers
//                 subject: 'Creative Tim Confirm Account', // Subject line
//                 // eslint-disable-next-line max-len
//                 html: '<h1>Hey,</h1><br><p>Confirm your new account </p><p><a href="' + 'http://localhost:3000/auth/confirm-email/' + user._id + '">"' + 'http://localhost:3000/auth/confirm-email/' + user._id + '"</a><br><br>If you did not ask for it, please let us know immediately at <a href="mailto:' + smtpConf.auth.user + '">' + smtpConf.auth.user + '</a></p>', // html body
//               });
//               // eslint-disable-next-line max-len
//               res.json({success: true, msg: 'The user was succesfully registered'});
//             }
//             // eslint-disable-next-line max-len
//             res.json({success: true, userID: user._id, msg: 'The user was succesfully registered'});
//           });
//         });
//       });
//     }
//   });
// });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // let user = await User.findOne({ email: email });
    let user = new User({ name, email, password });
    if (user) {
      return res.status(400).json({ success: false, msg: 'Email already exists' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user = new User({
      name: name,
      email: email,
      password: hash
    });

    await user.save();
    const userID = user._id; // Storing userID for use in the email link
    const confirmationLink = `http://${req.headers.host}/api/users/confirm-email/${user._id}`;

    // Envoi de l'email
    const html = `
        <h1>Email Confirmation</h1>
        <p>Please confirm your email by clicking on the following link: </p>
        <a href="${confirmationLink}">${confirmationLink}</a>
    `;
    sendEmail(email, 'Confirm your email', html);

    res.status(201).send({ success: true, message: 'User registered. Please check your email to confirm.' });
} catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error registering new user.' });
}
});
    // Don't send emails if it is in demo mode
//     if (process.env.DEMO !== 'yes') {
//       const transporter = nodemailer.createTransport(smtpConf);
//       await transporter.sendMail({
//         from: '"Creative Tim" <' + smtpConf.auth.user + '>',
//         to: email,
//         subject: 'Creative Tim Confirm Account',
//         html: `<h1>Hey,</h1><br><p>Confirm your new account by clicking on the link below:</p><p><a href="http://localhost:3000/auth/confirm-email/${userID}">Confirm Email</a></p><br>If you did not ask for this, please contact us immediately at <a href="mailto:${smtpConf.auth.user}">${smtpConf.auth.user}</a>`
//       });
//     }

//     res.json({ success: true, userID: user._id, msg: 'The user was successfully registered' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, msg: 'Server error' });
//   }
// });
router.post('/confirm-email/:userId', async (req, res) => {
  try {
      const user = await User.findById(req.params.userId);
      if (!user) {
          return res.status(404).send({ success: false, message: 'User not found.' });
      }
      user.accountConfirmation = true;  // Assurez-vous que votre modèle User a un champ `accountConfirmation`
      await user.save();
      res.send({ success: true, message: 'Email confirmed. You can now login.' });
  } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, message: 'Error confirming email.' });
  }
});

// router.post('/confirm/:id', (req, res) => {
//   const userID = req.params.id;

//   const query = {_id: userID};

//   const newvalues = {$set: {accountConfirmation: true}};
//   User.updateOne(query, newvalues, function(err, usr) {
//     if (err) {
//       res.json({success: false});
//     }
//     res.json({success: true});
//   });
// });

// router.post('/login', (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   User.findOne({email: email}, (err, user) => {
//     if (err) throw err;

//     if (!user) {
//       return res.json({success: false, msg: 'Wrong credentials'});
//     }

//     if (!user.accountConfirmation) {
//       return res.json({success: false, msg: 'Account is not confirmed'});
//     }

//     bcrypt.compare(password, user.password, function(err, isMatch) {
//       if (isMatch) {
//         const token = jwt.sign(user, config.secret, {
//           expiresIn: 86400, // 1 week
//         });
//         // Don't include the password in the returned user object
//         const query = {userId: user._id, token: 'JWT ' + token};
//         ActiveSession.create(query, function(err, cd) {
//           user.password = null;
//           user.__v = null;
//           return res.json({
//             success: true,
//             token: 'JWT ' + token,
//             user,
//           });
//         });
//       } else {
//         return res.json({success: false, msg: 'Wrong credentials'});
//       }
//     });
//   });
// });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ success: false, msg: 'Wrong credentials' });
    }

    if (!user.accountConfirmation) {
      return res.status(401).json({ success: false, msg: 'Account is not confirmed' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Wrong credentials' });
    }

    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400, // 1 week
    });

    // Don't include the password in the returned user object
    user.password = null;
    user.__v = null;

    // Create a session record in ActiveSession
    const sessionData = { userId: user._id, token: 'JWT ' + token };
    await ActiveSession.create(sessionData);

    res.json({
      success: true,
      token: 'JWT ' + token,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});


router.post('/checkSession', reqAuth, function(req, res) {
  res.json({success: true});
});

// router.post('/logout', reqAuth, function(req, res) {
//   const token = req.body.token;
//   ActiveSession.deleteMany({token: token}, function(err, item) {
//     if (err) {
//       res.json({success: false});
//     }
//     res.json({success: true});
//   });
// });
// Route pour la déconnexion
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  try {
    await ActiveSession.findOneAndDelete({ token });
    res.status(200).send({ success: true, message: 'Déconnecté avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Erreur lors de la déconnexion' });
  }
});

// router.post('api/clients', reqAuth, (req, res) => {
//   const { nom, details } = req.body;
//   // Assurez-vous que l'utilisateur est authentifié avec le middleware `reqAuth`
//   const user = req.user;

//   // Création d'une nouvelle instance de Client en utilisant le modèle Mongoose
//   const newClient = new Client({
//     nom: req.body.nomClient,
//     details: req.body.detailsClient,
//     centreId: user._id
// });


//   // Sauvegarder le nouveau client dans la base de données
//   newClient.save()
//     .then(client => {
//       res.status(201).send({ success: true, message: 'Client ajouté avec succès', client });
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).send({ success: false, message: "Erreur lors de l'ajout du client" });
//     });
// });


module.exports = router;
