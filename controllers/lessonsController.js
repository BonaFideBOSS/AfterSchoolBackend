const { db } = require("../config/database");
const { ObjectId } = require("mongodb");
const { isUserAdmin } = require("../helpers/helpers");

async function getAllLessons(req, res) {
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
}

async function rateLesson(req, res) {
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
}

async function createLesson(req, res) {
  const message = { message: "", color: "info" };
  try {
    isUserAdmin(req.body.password);
    delete req.body.password;

    const lesson = req.body;
    lesson.price = parseInt(lesson.price);
    lesson.spaces = parseInt(lesson.spaces);
    await db.collection("Lessons").insertOne(lesson);
    message.message = "Lesson added successfully.";
    message.color = "success";
  } catch (error) {
    message.message = "Failed to add lesson. " + error;
    message.color = "danger";
  }
  req.flash("systemMessages", [message]);
  res.redirect("/");
}

async function updateLesson(req, res) {
  const message = { message: "", color: "info" };
  try {
    isUserAdmin(req.body.password);
    delete req.body.password;

    const lessonId = req.body._id;
    delete req.body._id;
    const lesson = req.body;
    lesson.price = parseInt(lesson.price);
    lesson.spaces = parseInt(lesson.spaces);
    await db
      .collection("Lessons")
      .updateOne({ _id: new ObjectId(lessonId) }, { $set: lesson });
    message.message = "Lesson updated successfully.";
    message.color = "success";
  } catch (error) {
    message.message = "Failed to update lesson. " + error;
    message.color = "danger";
  }
  req.flash("systemMessages", [message]);
  res.redirect("/");
}

async function updateLessonSpaces(req, res) {
  const message = { message: "", color: "info" };
  try {
    isUserAdmin(req.body.password);
    delete req.body.password;

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
  req.flash("systemMessages", [message]);
  res.redirect("/");
}

module.exports = {
  getAllLessons,
  rateLesson,
  createLesson,
  updateLesson,
  updateLessonSpaces,
};
