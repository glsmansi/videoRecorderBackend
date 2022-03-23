const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  video: [{ url: String }],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("UserVideo", UserSchema);
