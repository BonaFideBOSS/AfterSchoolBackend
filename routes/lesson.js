const express = require("express");
const db = require("../config/database");

const lesson = express.Router();

lesson.get("/", async (req, res) => {
  var data = await db.collection("Lessons").find({}).toArray();
  res.send(data);
});

module.exports = lesson;
