const express = require("express");
const { ObjectId } = require("mongodb");
const db = require("../config/database");

const order = express.Router();

order.post("/new", async (req, res) => {
  const order = req.body;
  const orderStatus = {
    orderSuccessful: false,
    errorMessage: "Sorry, your order wasn't accepted.",
  };

  order.ip_address = req.ip;
  order.datetime = new Date();

  const lessonsAvailable = await checkLessonsAvailability(order.booked_lessons);

  if (lessonsAvailable) {
    await db.collection("Orders").insertOne(order);
    orderStatus.orderSuccessful = true;
    updateLessons(order.booked_lessons);
  } else {
    orderStatus.errorMessage = "The selected lessons are no longer available.";
  }

  res.send(orderStatus);
});

async function checkLessonsAvailability(cart) {
  cart.forEach((item) => {
    item._id = new ObjectId(item._id);
  });

  const lessons = await db
    .collection("Lessons")
    .aggregate([
      {
        $match: {
          _id: { $in: cart.map((item) => item._id) },
        },
      },
      {
        $addFields: {
          cartItem: {
            $arrayElemAt: [
              {
                $filter: {
                  input: cart,
                  as: "item",
                  cond: { $eq: ["$$item._id", "$_id"] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          $expr: { $gte: ["$spaces", "$cartItem.quantity"] },
        },
      },
    ])
    .toArray();

  return lessons.length == cart.length;
}

function updateLessons(cart) {
  cart.forEach((item) => {
    db.collection("Lessons").updateOne(
      { _id: new ObjectId(item._id) },
      { $inc: { spaces: -item.quantity } }
    );
  });
}

order.post("/myorders", async (req, res) => {
  const params = req.body;
  const search = params.search || "";
  var query = {
    $or: [
      { username: { $regex: new RegExp(`^${search}$`, "i") } },
      { phone: search },
    ],
  };
  query = search ? query : { ip_address: req.ip };
  var pipeline = [
    { $match: query },
    {
      $unwind: "$booked_lessons",
    },
    {
      $lookup: {
        from: "Lessons",
        localField: "booked_lessons._id",
        foreignField: "_id",
        as: "lessonDetails",
      },
    },
    {
      $unwind: "$lessonDetails",
    },
    {
      $addFields: {
        booked_lessons: {
          $mergeObjects: ["$booked_lessons", "$lessonDetails"],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        username: { $first: "$username" },
        phone: { $first: "$phone" },
        total_price: { $first: "$total_price" },
        ip_address: { $first: "$ip_address" },
        datetime: { $first: "$datetime" },
        booked_lessons: { $push: "$booked_lessons" },
      },
    },
    { $sort: { datetime: -1 } },
  ];
  const data = await db.collection("Orders").aggregate(pipeline).toArray();
  res.send(data);
});

module.exports = order;
