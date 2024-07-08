const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); //permet de ne pas avoir plusieurs utilisateur avec la même addresse mail


///***SCHEMA USER***//

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);