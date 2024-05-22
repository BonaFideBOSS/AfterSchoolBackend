const { db, client } = require("../config/database");
const { ObjectId } = require("mongodb");

async function createNewOrder(req, res) {
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
    orderStatus.errorMessage = "";
  } catch (error) {
    console.error("Error processing order", error);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }

  res.send(orderStatus);
}

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

async function getClientOrders(req, res) {
  const params = req.body;
  const search = params.search || "";
  var page = parseInt(params.page) || 1;
  page = page > 0 ? page : 1;
  const length = parseInt(params.length) || 5;

  var query = {
    $or: [
      { username: { $regex: new RegExp(`^${search}$`, "i") } },
      { phone: parseInt(search) },
    ],
  };
  query = search ? query : { ip_address: req.ip };
  const pipeline = [
    { $match: query },
    {
      $unwind: "$booked_lessons",
    },
    {
      $lookup: {
        from: "Lessons",
        localField: "booked_lessons._id",
        foreignField: "_id",
        pipeline: [{ $addFields: { my_rating: userRatingQuery(req) } }],
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
  const collection = db.collection("Orders");
  const dataCountTotal = collection.countDocuments(query);
  const dataCountFiltered = collection.countDocuments(query);
  var data = [dataCountTotal, dataCountFiltered];
  data = await Promise.all(data);

  var totalPages = Math.ceil(data[1] / length);
  page = page > totalPages && totalPages > 0 ? totalPages : page;
  const skip = (page - 1) * length;
  pipeline.push({ $skip: skip }, { $limit: length });

  const orders = await collection.aggregate(pipeline).toArray();
  data = {
    orders: orders,
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

const userRatingQuery = (req) => {
  return {
    $let: {
      vars: {
        userRating: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$ratings",
                as: "rating",
                cond: { $eq: ["$$rating.ip_address", req.ip] },
              },
            },
            0,
          ],
        },
      },
      in: { $ifNull: ["$$userRating.rating", 0] },
    },
  };
};

module.exports = { createNewOrder, getClientOrders };
