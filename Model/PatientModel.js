const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    dob: String,
    gender: String,
    blood: String,
    height: String,
    weight: String,
    allergies: String,
    conditions: String,
    doctor: String,
    role: { type: String, default: "user" },
  },
  { versionKey: false }
);

const userModel = mongoose.model("Patient", userSchema);

module.exports = userModel;
