const express = require("express");
const cors = require("cors");
const corsOptions = require("../config/cors");
const apiGuard = require("../middlewares/ipBlocker");

const {
  getAllLessons,
  rateLesson,
  createLesson,
  updateLesson,
  updateLessonSpaces,
} = require("../controllers/lessonsController");

const lesson = express.Router();
lesson.use(cors(corsOptions));
lesson.use(apiGuard());

lesson.post("/", getAllLessons);
lesson.put("/rate/", rateLesson);
lesson.post("/new/", createLesson);
lesson.post("/update/", updateLesson);
lesson.post("/updateLessonSpaces", updateLessonSpaces);

module.exports = lesson;
