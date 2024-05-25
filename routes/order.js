const express = require("express");
const cors = require("cors");
const corsOptions = require("../config/cors");

const {
  createNewOrder,
  getClientOrders,
} = require("../controllers/ordersController");

const order = express.Router();
order.use(cors(corsOptions()));

order.post("/new/", createNewOrder);
order.post("/myorders/", getClientOrders);

module.exports = order;
