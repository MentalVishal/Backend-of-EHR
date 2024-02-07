const express = require("express");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const userModel = require("../Model/PatientModel");
const { auth } = require("../Middleware/Auth");

require("dotenv").config();

const userRoute = express.Router();

userRoute.post("/register", async (req, res) => {
  try {
    const {
      name,
      dob,
      gender,
      email,
      password,
      blood,
      height,
      weight,
      allergies,
      conditions,
      doctor,
    } = req.body;
    const isUser = await userModel.findOne({ email });
    if (isUser) {
      res.status(200).json({ msg: "User Already Exist" });
    } else {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (err) {
          res.status(404).json({ err: err });
        } else {
          const user = new userModel({
            email,
            name,
            password: hash,
            dob,
            gender,
            blood,
            height,
            weight,
            allergies,
            conditions,
            doctor,
          });
          await user.save();
          res.status(200).json({ msg: "Register Sucessful", User: user });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

userRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (user) {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          jwt.sign(
            { userID: user._id, userName: user.name, role: user.role },
            process.env.secrete,
            { expiresIn: "7d" },
            (err, token) => {
              if (token) {
                res.json({
                  msg: "User login Sucessfull",
                  Token: token,
                  User: user,
                });
              } else {
                res.json({ err: err.message });
                return;
              }
            }
          );
        } else {
          res.json({ msg: "Invalid Credentials." });
          return;
        }
      });
    } else {
      res.json({ msg: "User doesnt exist, please register." });
      return;
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

userRoute.patch("/update/:userId", auth, async (req, res) => {
  try {
    if (req.body.role === "admin" || req.body.userID === req.params.userId) {
      const userId = req.params.userId;
      const {
        name,
        dob,
        gender,
        email,
        password,
        blood,
        height,
        weight,
        allergies,
        conditions,
        doctor,
      } = req.body;

      let user = await userModel.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.name = name;
      user.dob = dob;
      user.gender = gender;
      user.email = email;
      user.blood = blood;
      user.height = height;
      user.weight = weight;
      user.allergies = allergies;
      user.conditions = conditions;
      user.doctor = doctor;

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 5);
        user.password = hashedPassword;
      }

      user = await user.save();

      res.status(200).json({ msg: "User updated successfully", user });
    } else {
      res.status(400).json({ msg: "You are not Authorized" });
    }
  } catch (error) {
    res.status(400).json({ err: error.message });
  }
});

userRoute.delete("/delete/:userId", async (req, res) => {
  try {
    if (req.body.role === "admin" || req.body.userID === req.params.userId) {
      const userId = req.params.userId;

      const deletedUser = await userModel.findByIdAndDelete({ _id: userId });

      if (!deletedUser) {
        return res.status(404).json({ msg: "User not found" });
      }

      res
        .status(200)
        .json({ msg: "User deleted successfully", user: deletedUser });
    } else {
      res.status(200).json({ msg: "You are not Authorized" });
    }
  } catch (error) {
    res.status(400).json({ err: error.message });
  }
});

userRoute.get("/users", async (req, res) => {
  try {
    const users = await userModel.find();

    if (users.length === 0) {
      return res.status(404).json({ msg: "No users found" });
    }

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRoute.get("/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  userRoute,
};
