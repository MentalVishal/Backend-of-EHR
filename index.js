const express = require("express");
const cors = require("cors");
const { Connection } = require("./db");
const { userRoute } = require("./Routes/userRoutes");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/user", userRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the Backend of Electronic Health Records");
});

app.listen(process.env.port, async () => {
  try {
    await Connection;
    console.log("Connected to Database");
    console.log(`Running at port ${process.env.port}`);
  } catch (error) {
    console.log("Something Went Wrong");
  }
});
