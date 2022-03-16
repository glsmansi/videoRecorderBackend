const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
  token: String,
});

module.exports = mongoose.model("User", UserSchema);
