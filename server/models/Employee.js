

/* Require mongoose to interact with mongoDB */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

/*
 * Employee schema
 */
const employeeSchema = mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, index: true, required: true },
  password: { type: String, required: true },
  phone_number: { type: String, required: true },
  role: { type: String, required: true },
  company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
});
// checking if password is valid
employeeSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
// generating a hash
employeeSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
module.exports = mongoose.model('employee', employeeSchema);
