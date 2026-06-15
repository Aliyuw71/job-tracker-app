const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide user name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
  },
  lastName: {
    type: String,
    maxlength: 20,
    trim: true,
    default: "Last name",
  },
  location: {
    type: String,
    trim: true,
    maxlength: 20,
    default: "My city",
  },
});
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.createJWT = function () {
  const secretKey = process.env.JWT_SECRET_KEY;
  const expirydate = process.env.END_OF_LIFE;
  const token = jwt.sign({ userId: this._id, name: this.name }, secretKey, {
    expiresIn: expirydate,
  });
  return token;
};
UserSchema.methods.comparePassword = async function (loginPassword) {
  const comparePassword = await bcrypt.compare(loginPassword, this.password);
  return comparePassword;
};
module.exports = mongoose.model("User", UserSchema);
