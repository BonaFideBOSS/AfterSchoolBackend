const express = require("express");
const { db, client } = require("../config/database");
const { ObjectId } = require("mongodb");

const order = express.Router();

order.post("/new/", async (req, res) => {
  const order = req.body;
  const orderStatus = {
    orderSuccessful: false,
    errorMessage: "Sorry, your order wasn't accepted.",
  };

  order.ip_address = req.ip;
  order.datetime = new Date();

  const session = client.startSession();
  session.startTransaction();

  try {
    if (!(await areLessonsAvailable(order.booked_lessons, session))) {
      orderStatus.errorMessage =
        "The selected lessons are no longer available.";
      throw Error(orderStatus.errorMessage);
    }

    await updateLessons(order.booked_lessons, session);
    await db.collection("Orders").insertOne(order, { session });
    await session.commitTransaction();

    orderStatus.orderSuccessful = true;
  } catch (error) {
    console.error("Error processing order", error);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }

  res.send(orderStatus);
});

async function areLessonsAvailable(cart, session) {
  cart.forEach((item) => {
    item._id = new ObjectId(item._id);
  });

  const lessons = await db
    .collection("Lessons")
    .aggregate(
      [
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
      ],
      { session }
    )
    .toArray();

  return lessons.length == cart.length;
}

async function updateLessons(cart, session) {
  for (const item of cart) {
    await db
      .collection("Lessons")
      .updateOne(
        { _id: new ObjectId(item._id), spaces: { $gt: 0 } },
        { $inc: { spaces: -item.quantity } },
        { session }
      );
  }
}

order.post("/myorders/", async (req, res) => {
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
