const { MongoClient } = require("mongodb");

const URI = process.env.MONGO_URI;
var client;
var db;
try {
  client = new MongoClient(URI);
  db = client.db("AfterSchool");
  console.log("Connected to database.");
} catch (e) {
  console.error("Database connection failed. - Error:" + e);
}

module.exports = { db, client };
