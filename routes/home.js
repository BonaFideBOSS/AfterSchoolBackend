const express = require("express");
const { db } = require("../config/database");

const home = express.Router();

home.get("/", async (req, res) => {
  // db.collection("Lessons").updateMany({}, { $set: { spaces: 5 } });
  // db.collection('Orders').deleteMany({})
  res.render("home");
});

module.exports = home;
