const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: Buffer,
  },
});
// UserSchema.statics.getUserFromToken = async function (token) {
//   const User = this;
//   const { id } = await verifyJWT(token, jwtSecret);
//   const user = await User.findById(id);
//   return user;
// };

module.exports = mongoose.model('user', UserSchema);
