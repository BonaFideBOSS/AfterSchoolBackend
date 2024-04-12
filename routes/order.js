const express = require("express");
const { ObjectId } = require("mongodb");
const db = require("../config/database");

const order = express.Router();

order.post("/new", async (req, res) => {
  const order = req.body;
  const orderStatus = { orderSuccessful: false };

  order.ip_address = req.ip;
  order.datetime = new Date();

  const lessonsAvailable = await checkLessonsAvailability(order.lessons_booked);

  if (lessonsAvailable) {
    await db.collection("Orders").insertOne(order);
    orderStatus.orderSuccessful = true;
    updateLessons(order.lessons_booked);
  }

  res.send(orderStatus);
});

module.exports = order;

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
