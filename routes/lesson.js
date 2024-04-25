const express = require("express");
const { db } = require("../config/database");
const { ObjectId } = require("mongodb");

const lesson = express.Router();

lesson.post("/", async (req, res) => {
  const params = req.body;
  const search = params.search || "";
  const sortBy = params.sortBy || "subject";
  const sortOrder = params.sortOrder == "desc" ? -1 : 1;
  const pipeline = [];

  const searchFields = ["subject", "location"];
  var searchQuery = {
    $or: searchFields.map((item) => ({
      [item]: { $regex: search, $options: "i" },
    })),
  };
  searchQuery = search ? pipeline.push({ $match: searchQuery }) : {};
  pipeline.push({
    $addFields: {
      average_rating: { $round: [{ $avg: "$ratings.rating" }, 1] },
    },
  });
  pipeline.push({ $sort: { [sortBy]: sortOrder } });

  const data = await db.collection("Lessons").aggregate(pipeline).toArray();
  res.send(data);
});

lesson.put("/rate/", async (req, res) => {
  const params = req.body;
  const ratingStatus = {
    ratingSuccessful: false,
    errorMessage: "Sorry, your rating wasn't registered.",
  };

  try {
    const lessonId = new ObjectId(params.lessonId);
    const rating = params.rating || 0;

    if (!(rating > 0 && rating <= 5)) {
      ratingStatus.errorMessage = "Please rate the lesson between 1 and 5";
      throw Error(ratingStatus.errorMessage);
    }

    const collection = db.collection("Lessons");
    const queryOne = await collection.updateOne(
      { _id: lessonId, "ratings.ip_address": req.ip },
      { $set: { "ratings.$.rating": rating } }
    );
    if (queryOne.matchedCount == 0) {
      await collection.updateOne(
        { _id: lessonId },
        { $addToSet: { ratings: { ip_address: req.ip, rating: rating } } }
      );
    }

    ratingStatus.ratingSuccessful = true;
    ratingStatus.errorMessage = "";
  } catch (error) {
    console.log(error);
  }

  res.send(ratingStatus);
});

module.exports = lesson;
