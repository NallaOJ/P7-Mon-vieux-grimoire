const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Traite les requêtes HTTP au format JSON
app.use(express.json());

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

/*const bdPassword = process.env.PASSWORD_BD;
const bdUser = process.env.USER_BD;

console.log('User:', bdUser);
console.log('Password:', bdPassword);
*/





// Connexion à MongoDB
mongoose.connect("mongodb+srv://OJMVG:xVQM5kChugqTSRvS@mvg-oc-oj.rkexmki.mongodb.net/?retryWrites=true&w=majority&appName=MVG-OC-OJ")
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


// Routes
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;
