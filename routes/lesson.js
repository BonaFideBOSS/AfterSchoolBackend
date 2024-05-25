const express = require("express");
const cors = require("cors");
const corsOptions = require("../config/cors");
const { db } = require("../config/database");
const { ObjectId } = require("mongodb");
const { isUserAdmin } = require("../helpers/helpers");

const {
  getAllLessons,
  rateLesson,
  createLesson,
  updateLesson,
  updateLessonSpaces,
} = require("../controllers/lessonsController");

const lesson = express.Router();
lesson.use(cors(corsOptions()));

lesson.post("/", async (req, res) => {
  const params = req.body;
  const search = params.search || "";
  const sortBy = params.sortBy || "subject";
  const sortOrder = params.sortOrder == "desc" ? -1 : 1;
  var page = parseInt(params.page) || 1;
  page = page > 0 ? page : 1;
  const length = parseInt(params.length) || 5;
  const pipeline = [];

  const searchFields = ["subject", "location"];
  var searchQuery = {
    $or: searchFields.map((item) => ({
      [item]: { $regex: search, $options: "i" },
    })),
  };
  searchQuery = search ? searchQuery : {};
  pipeline.push({ $match: searchQuery });
  pipeline.push({
    $addFields: {
      rating_count: { $size: "$ratings" },
      average_rating: { $round: [{ $avg: "$ratings.rating" }, 1] },
    },
  });
  pipeline.push({ $sort: { [sortBy]: sortOrder, subject: 1 } });

  const collection = db.collection("Lessons");
  const lessonsCountTotal = collection.countDocuments({});
  const lessonsCountFiltered = collection.countDocuments(searchQuery);
  var data = [lessonsCountTotal, lessonsCountFiltered];
  data = await Promise.all(data);

  var totalPages = Math.ceil(data[1] / length);
  page = page > totalPages && totalPages > 0 ? totalPages : page;
  const skip = (page - 1) * length;
  pipeline.push({ $skip: skip }, { $limit: length });

  const lessons = await collection.aggregate(pipeline).toArray();
  data = {
    lessons: lessons,
    pagination: {
      page: page,
      length: length,
      total: data[0],
      filtered: data[1],
      totalPages: totalPages,
      start: (page - 1) * length + 1,
    },
  };
  data.pagination.end = Math.min(
    data.pagination.start + length - 1,
    data.pagination.filtered
  );
  res.send(data);
});
lesson.put("/rate/", rateLesson);
lesson.post("/new/", createLesson);
lesson.post("/update/", updateLesson);
lesson.post("/updateLessonSpaces", updateLessonSpaces);

module.exports = lesson;
