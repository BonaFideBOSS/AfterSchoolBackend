const express = require("express");
const { db } = require("../config/database");
const { ObjectId } = require("mongodb");

const home = express.Router();

home.get("/", async (req, res) => {
  res.render("home", { systemMessages: req.flash("systemMessages") });
});

module.exports = home;
