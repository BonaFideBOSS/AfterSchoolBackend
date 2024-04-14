const express = require("express");
const { db } = require("../config/database");

const lesson = express.Router();

lesson.post("/", async (req, res) => {
  const params = req.body;
  const search = params.search || "";
  const sortBy = params.sortBy || "subject";
  const sortOrder = params.sortOrder == "desc" ? -1 : 1;

  const searchFields = ["subject", "location"];
  var searchQuery = {
    $or: searchFields.map((item) => ({
      [item]: { $regex: search, $options: "i" },
    })),
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
