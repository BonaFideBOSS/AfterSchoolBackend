const express = require("express");
const db = require("../config/database");

const lesson = express.Router();

lesson.post("/", async (req, res) => {
  const params = req.body;
  const sortOptions = ["subject", "location", "price", "spaces"];

  const search = params.search || "";
  const sortBy = sortOptions.includes(params.sortBy)
    ? params.sortBy
    : "subject";
  const sortOrder = params.sortOrder == "desc" ? -1 : 1;

  var searchQuery = {
    $or: [
      { subject: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ],
  };
  searchQuery = search ? searchQuery : {};
  var sortQuery = { [sortBy]: sortOrder };

  const data = await db
    .collection("Lessons")
    .find(searchQuery)
    .sort(sortQuery)
    .toArray();
  res.send(data);
});

module.exports = lesson;
