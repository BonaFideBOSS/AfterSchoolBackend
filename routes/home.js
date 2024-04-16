const express = require("express");
const { db } = require("../config/database");
const { ObjectId } = require("mongodb");
const lesson = require("./lesson");

const home = express.Router();

home
  .route("/")
  .get(async (req, res) => {
    res.render("home", { systemMessages: [] });
  })
  .post(async (req, res) => {
    const message = { message: "", color: "info" };
    try {
      isUserAdmin(req.body.password);
      const lessonId = req.body.lessonId;
      const lesson = lessonId ? { _id: new ObjectId(lessonId) } : {};
      const spaces = parseInt(req.body.spaces);

      if (!(spaces >= 0)) {
        throw Error("Spaces must be 0 or more.");
      }

      await db
        .collection("Lessons")
        .updateMany(lesson, { $set: { spaces: spaces } });
      message.message = "Lessons updated successfully.";
      message.color = "success";
    } catch (error) {
      message.message = "Failed to update lessons. " + error;
      message.color = "danger";
    }
    res.render("home", { systemMessages: [message] });
  });

function isUserAdmin(password) {
  const adminPassword = process.env.adminPassword;
  if (password != adminPassword) {
    throw Error("Incorrect Password");
  }
}

module.exports = home;
